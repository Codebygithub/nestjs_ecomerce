import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, Query } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { EntityManager, Like, Repository } from 'typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { filterTitleDto } from './dto/filter-title.dto';
import { filterBlogDto } from './dto/filter-blog.dto';
import { EmailService } from 'src/email/email.service';
import { QueueService } from './email-blog.service';
import { UserService } from 'src/user/user.service';
import { use } from 'passport';
import { throws } from 'assert';

@Injectable()
export class BlogService {
  constructor(@InjectRepository(BlogEntity) private readonly blogRepository:Repository<BlogEntity>,
                                            private readonly categoryService:CategoriesService,
                                            private readonly entitymanager:EntityManager,
                                            private readonly emailService:EmailService,
                                            private readonly userService:UserService,
                                            private queueService:QueueService
                                          )
  {}


  async create(createBlogDto: CreateBlogDto,currentUser:UserEntity):Promise<BlogEntity> {
    const category = await this.categoryService.findOne(createBlogDto.categoryId)
    if(!category) throw new NotFoundException('CATEGORY NOT FOUND ')
    try {
      return this.entitymanager.transaction(async entityManager => {
        const blog = await this.entitymanager.create(BlogEntity,{
          ...createBlogDto,
          user:currentUser ,
          category
        })
        await this.queueService.sendEmailNotification(createBlogDto,currentUser) 
        const saved = await entityManager.save(blog)
        return saved
      })
    } catch (error) {
      throw new InternalServerErrorException('FAILED TO SAVED THE BLOG , PLEASE TRY AGAIN ')
    }
  
  }
  async getViewBlogByUser(userId:number,blogId:number):Promise<BlogEntity[]> {
    const user = await this.userService.findOne(userId)
    console.log('user',user)
    if(!user) throw new NotFoundException('USER NOT FOUND')
    const blog = await this.findOne(blogId)
    if(!blog) throw new NotFoundException('BLOG NOT FOUND')
    console.log('blog' , blog)
    blog.user = user
    return  user.blog
    
  }

  async findByTitle(query:filterTitleDto):Promise<BlogEntity[]> {
    const title = query.title
    const blog = await this.blogRepository.find({
      where:{title}
    })
    return blog
  }
  async titleExists(title: string): Promise<boolean> {
    const count = await this.blogRepository.createQueryBuilder("blog")
        .where("blog.title = :title", { title })
        .getCount();
    return count > 0;
}

  async findOne(id:number): Promise<BlogEntity>{
    const blog = await this.blogRepository.findOne({
      where: { id: id },
      relations: {
          user: true,
          category: true
      },
      select: {
        user: {
          id:true,
          name:true,
          email:true
        },
        category:{
          id:true ,
          title:true
          
        }
      }
  });

  if (!blog) {
      throw new NotFoundException('BLOG NOT FOUND');
  }

  return blog;
  }
  async findAll(query:filterBlogDto) {
    const item_per_page  = query.item_per_page || 10 
    const page = Number(query.page) || 1 ;
    if(query.item_per_page <= 0  || page <= 0  ) throw new BadRequestException('Invalid page or item_per_page value.') 
    const skip = (page - 1 ) * item_per_page 
    const keyword = query.search || '' 
    const whereConditions:any = {
      title:Like(`%${keyword}%`)
    }
    const [res,total] = await this.blogRepository.findAndCount({
      where:whereConditions , 
      take:item_per_page ,
      skip,
      order:{createdAt:'DESC'},
      select:['category',,'createdAt','description','id','image','title','updatedAt','user']
    })
    const lastPage = Math.ceil(total/item_per_page) 
    const nextPage = page + 1 > lastPage ? null : page + 1 
    const prevPage = page - 1 < 1 ? null : page - 1 ;
    return{ 
      data:res , 
      total , 
      currentPage:page , 
      nextPage ,
      lastPage  , 
      prevPage
    }
  }

  






  

  async update(id: number, fields:Partial<UpdateBlogDto> , currentUser:UserEntity): Promise<BlogEntity> {
    const blog = await this.findOne(id)
    if(!blog) throw new NotFoundException('BLOG NOT FOUND')
    Object.assign(blog,fields)
    blog.user = currentUser
    if(fields.categoryId) {
      const category = await this.categoryService.findOne(fields.categoryId)
      blog.category= category;
    }
    return await this.blogRepository.save(blog)
    
  }

  async remove(id:number , currentUser:UserEntity):Promise<BlogEntity> {
    const blog = await this.findOne(id)
    if(!blog) throw new NotFoundException('NOT FOUND')
    if(currentUser.id != blog.user.id) throw new ForbiddenException()
    return await this.blogRepository.remove(blog)
  }
}