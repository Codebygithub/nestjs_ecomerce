import { BadGatewayException, BadRequestException, Inject, Injectable, NotFoundException, Search, forwardRef } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Connection, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { FilterProductDto } from './dto/filter-product.dto';
import { UserService } from 'src/user/user.service';
import { OrderStatus } from 'src/order/enum/order-status.enum';
import dataSource from 'db/data_source';
import { OrderService } from 'src/order/order.service';
import { ReviewEntity } from 'src/review/entities/review.entity';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { min } from 'class-validator';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { query } from 'express';
import { InventoryEntity } from 'src/inventory/entities/inventory.entity';
import {pick} from 'lodash'

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(ProductEntity) private readonly productRepository:Repository<ProductEntity>,
  private readonly categoryService:CategoriesService,
  private readonly userService:UserService,
  @InjectRepository(CategoryEntity) private readonly categoriesRepository:Repository<CategoryEntity>,
  @InjectRepository(InventoryEntity) private readonly inventoriesRepository:Repository<InventoryEntity>,
  @Inject(forwardRef(()=>OrderService)) private readonly orderService:OrderService,
  @Inject(CACHE_MANAGER) private cacheManager:Cache,
  private readonly connection:Connection,

  ){}
  async create(createProductDto: CreateProductDto,currentUser:UserEntity):Promise<ProductEntity> {
    const category = await this.categoryService.findOne(createProductDto.categoryId)
    if(!category) throw new NotFoundException('Category went wrong')
    const product = this.productRepository.create(createProductDto)
    product.category = category
    product.addedBy = currentUser
    const saveProduct = await this.productRepository.save(product)
    const existingInventory = await this.inventoriesRepository.findOne({where:{id:createProductDto.inventoryId}})
    if(existingInventory) {
      existingInventory.stock += createProductDto.stock || 0 
      await this.inventoriesRepository.save(existingInventory)
    }else {
      const newInventory = this.inventoriesRepository.create({
        user:currentUser,
        stock:createProductDto.stock,
        location:'unknown',
        reservations:[],
      })
      await this.inventoriesRepository.save(newInventory)
      
    }
    await this.invaliddateCache()
    return saveProduct;    
  }

  async findAllDraftProduct(limit: number, skip: number): Promise<ProductEntity[]> {
    console.log('limit',limit)
    console.log('skip' ,skip)
    return await this.productRepository.find({
      where: { isDraft: true },
      order: { updatedAt: 'DESC' },
      take: limit,
      skip: skip,
    });
  }
  
  async publishedProduct(productId:number , currentUser:UserEntity):Promise<Pick<ProductEntity, "id" | "title" | "price" | "stock" | "isDraft" | "isPublished" | "saled">> {
    const product = await this.productRepository.findOne({where:{id:productId}})
    if(!product) throw new NotFoundException(`Product ${productId} not found`)
    product.isDraft = false 
    product.isPublished = true;
    const saveProduct = await this.productRepository.save(product)
    return pick(saveProduct, ['id', 'title', 'price', 'stock', 'isDraft', 'isPublished', 'saled']);

  }
  async draftProduct(productId:number,currentUser:UserEntity) {
    const product = await this.productRepository.findOne({where:{id:productId }})
    if(!product) throw new NotFoundException(`Product ${productId} not found`)
    product.isDraft = true 
    product.isPublished = false;
    return this.productRepository.save(product)

  }
  

  private async invaliddateCache() {
    const keys:string[] = await this.cacheManager.store.keys();
    for(const key of keys) {
      await this.cacheManager.del(key)
    }
  }
  async findAll(query:FilterProductDto):Promise<any> {
   const cacheKey = JSON.stringify({
    search:query.search,
    minPrice:query.minPrice,
    maxPrice:query.maxPrice,
    category:query.category
   })
   const cacheResult = await this.cacheManager.get(cacheKey)
   if (cacheResult) {
    await this.cacheManager.del(cacheKey)
    return JSON.parse(cacheResult as string)
   }
   else {
      const itemsPerPage = Number(query.item_per_page) || 10;
      const page = Number(query.page) || 1;
      const skip = (page - 1) * itemsPerPage;
      const keyword = query.search ? query.search.replace(/[^\w\s]/gi, '') : '';
      const minPrice = Number(query.minPrice) ? Number(query.minPrice) : 0;
      const maxPrice = Number(query.maxPrice) ? Number(query.maxPrice) : Number.MAX_SAFE_INTEGER;
      const minRating = Number(query.minRating) ? Number(query.minRating) : 0;
      const maxRating = Number(query.maxRating) ? Number(query.maxRating) : 5;
      const whereConditions:any = {
        title:Like(`%${keyword}%`),
        price:Between(minPrice,maxPrice)
      };
      if(query.category) {
        whereConditions.category = query.category
      }
      if(minRating !== 0 || maxRating !==0 ) {
        whereConditions.reviews = {
          rating:Between(minRating,maxRating)
        }
      }
      const [res, total] = await this.productRepository.findAndCount({
        where: whereConditions,
        take: itemsPerPage,
        skip,
        order: { createdAt: 'DESC' },
        select: ['id', 'price', 'stock', 'title', 'reviews', 'category', 'createdAt', 'updatedAt'],
      });
      const lastPage = Math.ceil(total / itemsPerPage);
      const nextPage = page + 1 > lastPage ? null : page + 1;
      const prevPage = page - 1 < 1 ? null : page - 1;
      const result = {
        data: res,
        total,
        currentPage: page,
        nextPage,
        prevPage,
        lastPage,
      };
      await this.cacheManager.set(cacheKey ,JSON.stringify(result),3600)
      return result;
   }
  }

  async increaseViewCount(productId:number,currentUser:UserEntity):Promise<ProductEntity>{ 
    let product = await this.findOne(productId)
    if(!product) throw new NotFoundException('product not found')
    if(product) {
      product.view +=1 
      product.addedBy = currentUser
      await this.productRepository.save(product)
    }
    return product
  } 

  async getRecommededProduct(productId:number): Promise<ProductEntity[]>{
    const products = await this.productRepository.find({
      where:{id:productId},
      relations:{reviews:true}
    })
    if(!products) throw new NotFoundException('PRODUCT NOT FOUND')

    const recomendedProduct =  products.sort((a,b)=>{
      const avgRatingA = this.calculateAverageRating(a.reviews)
      const avgRatingB = this.calculateAverageRating(b.reviews)
      return avgRatingA - avgRatingB

    })
    return recomendedProduct

    
    

  }
  private calculateAverageRating(reviews: ReviewEntity[]): number {
    if (!reviews || reviews.length === 0) {
      return 0;
    }

    const totalRating = reviews.reduce((acc, review) => acc + review.ratings, 0);
    return totalRating / reviews.length;
  }
  async findOne(id: number):Promise<ProductEntity> {
    const cacheKey = `product_${id}`;
    const cachedProduct = await this.cacheManager.get(cacheKey);
  if (cachedProduct) {
    return JSON.parse(cachedProduct as string)
  }
    const product = await this.productRepository.findOne({
      where:{id},
      relations:{addedBy:true , category:true,},
      select:{
        addedBy:{
          id:true,
          name:true,
          email:true
        },
        category:{
          id: true,
          title: true,
          

        }
      }
    })
    if(!product) throw new BadRequestException()
    await this.cacheManager.set(cacheKey,product,3600)
    return product
  
    
  }

  async isOwnerUserProduct(addedBy:number,currentUser:number):Promise<boolean>{
    const user = await this.userService.findOne(currentUser)
    if(!user) throw new NotFoundException()
    return addedBy === user.id

  }

  

  async update(id: number, fields:Partial<UpdateProductDto>,currentUser:UserEntity):Promise<ProductEntity> {
    const product = await this.findOne(id)
    if(!product) throw new NotFoundException('Product not found ')
    Object.assign(product,fields)
    product.addedBy = currentUser
    if(fields.categoryId)
    {
      const category = await this.categoryService.findOne(fields.categoryId)
      product.category = category
    } 
   
    return await this.productRepository.save(product)
  }

  async remove(id: number,currentUser:UserEntity) {
    const product = await this.findOne(id)
    let order = await this.orderService.findOneByProduct(product.id)
    if(order) throw new BadRequestException('order in use ')
    product.addedBy = currentUser
    return await this.productRepository.remove(product)
  }

  async updateStock(id:number , stock:number , status:string)
  {
    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      if(typeof stock !=='number' || stock <=0) {
        throw new BadRequestException('stock must be postitive integer')
      }
      if(status !== OrderStatus.PROCESSING && status !== OrderStatus.SHIPPED && status !== OrderStatus.DELIVERED && status !== OrderStatus.CENCELLED) {
        throw new BadRequestException('Invalid order status');
      }
      let product = await this.findOne(id)
      if(status === OrderStatus.DELIVERED)
      {
        product.stock-=stock
      }else{
        product.stock +=stock
      }
      product = await queryRunner.manager.save(product)
      await queryRunner.commitTransaction()
      return product;
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    }
    finally {
      await queryRunner.release();
    }
   
  }

  async suggestCategoriesBySales(n:number): Promise<CategoryEntity[]> {
    const categories = await this.categoriesRepository.createQueryBuilder('category')
    .leftJoin('category.products','product')
    .select('category.id , category.title,SUM(product.saled) AS totalSales')
    .groupBy('category.id , category.title')
    .orderBy('totalSales','DESC')
    .limit(n)
    .getRawMany()
    return categories
  }
}
