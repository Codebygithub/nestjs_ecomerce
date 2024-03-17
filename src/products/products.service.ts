import { BadGatewayException, BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { FilterProductDto } from './dto/filter-product.dto';
import { UserService } from 'src/user/user.service';
import { OrderStatus } from 'src/order/enum/order-status.enum';
import dataSource from 'db/data_source';
import { OrderService } from 'src/order/order.service';
import { ReviewEntity } from 'src/review/entities/review.entity';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(ProductEntity) private readonly productRepository:Repository<ProductEntity>,
  private readonly categoryService:CategoriesService,
  private readonly userService:UserService,
  @Inject(forwardRef(()=>OrderService)) private readonly orderService:OrderService
  ){}
  async create(createProductDto: CreateProductDto,currentUser:UserEntity):Promise<ProductEntity> {
    const category = await this.categoryService.findOne(createProductDto.categoryId)
    if(!category)  throw new NotFoundException('Category not found');
    const product = this.productRepository.create(createProductDto)
    product.category = category
    product.addedBy = currentUser
    return await this.productRepository.save(product)
  }

  async findAll(query:any):Promise<{product:any,totalProducts,limit}> {
    let filterTotalProducts:number ;
    let limit:number;

    if(!query.limit)
    {
      limit = 4 

    }
    else{
      limit = query.limit
    }

    const queryBuilder = dataSource.getRepository(ProductEntity)
    .createQueryBuilder('product')
    .leftJoinAndSelect('product.category','category')
    .leftJoin('product.reviews','review')
    .addSelect([
      'COUNT(review.id) AS reviewCount',
      'AVG(review.ratings::numeric(10,2) AS avgRating',
    ])
    .groupBy('product.id,category.id');

    const totalProducts = await queryBuilder.getCount();

    if(query.search)
    {
      const search = query.search
       queryBuilder.andWhere('product.title like :title',{
        title: `%${search}%`
       })
    }
    if(query.category)
    {
      queryBuilder.andWhere('category.id=:id',{id:query.category})
    }
    if(query.minPrice !=undefined){
      queryBuilder.andWhere("CAST(product.price as numeric) >= :minPrice",{ minPrice:query.minPrice})
    }
    if(query.maxPrice !=undefined){
      queryBuilder.andWhere("CAST(product.price as numeric) <= :maxPrice",{ maxPrice:query.maxPrice})
    }
    if(query.minRating !=undefined){
      queryBuilder.andWhere("review.ratings >= :rating",{ rating:query.minRating})
    }
    if(query.maxRating !=undefined){
      queryBuilder.andWhere("review.ratings <= :rating",{ rating:query.maxRating})
    }
    
    if(query.offset)
    {
      queryBuilder.offset(query.offset)
    }

    queryBuilder.limit(limit)

    
    


    const products = await queryBuilder.getRawMany()
    return {product:products,totalProducts,limit}



    // const items_per_page = filterProductDto.items_per_page || 10 ; 
    // const page = Number(filterProductDto.page) || 1 ;
    // const skip = (page - 1 ) * +items_per_page
    // const keyword = filterProductDto.search || ''
    // const [res,total] =  await this.productRepository.findAndCount({
    //   where:[
        
    //     title:Like('%' + keyword +'%')},{
        
    //   ],
    //   order:{createdAt:"DESC"},
    //   take:+items_per_page,
    //   skip,
    //   relations:{
    //     addedBy:true,
    //     category:true
    //   },
    //   select:['title','description','price','addedBy','category','createdAt','updatedAt','id']


    // })
    // const lastPage = Math.ceil(total/+items_per_page)
    // const nextPage = page + 1 > lastPage ? null :page + 1
    // const prevPage = page - 1 < 1 ? null : page - 1
     
    // return {
    //   data : res , 
    //   total , 
    //   lastPage ,
    //   prevPage ,
    //   currentPage:page, 
    //   nextPage
    // }

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

  async remove(id: number) {
    const product = await this.findOne(id)
    let order = await this.orderService.findOneByProduct(product.id)
    if(order) throw new BadRequestException('order in use ')
    return await this.productRepository.remove(product)
  }

  async updateStock(id:number , stock:number , status:string)
  {
    let product = await this.findOne(id)
    if(!product) throw new NotFoundException('product not found')
    if(status === OrderStatus.DELIVERED)
    {
      product.stock-=stock
    }else{
      product.stock +=stock
    }
    product = await this.productRepository.save(product)
    return product;
  }
}
