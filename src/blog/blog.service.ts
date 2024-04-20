import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, Query } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { Like, Repository } from 'typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { filterTitleDto } from './dto/filter-title.dto';
import { filterBlogDto } from './dto/filter-blog.dto';

@Injectable()
export class BlogService {
  constructor(@InjectRepository(BlogEntity) private readonly blogRepository:Repository<BlogEntity>,
                                            private readonly categoryService:CategoriesService
  ){}


  async create(createBlogDto: CreateBlogDto,currentUser:UserEntity):Promise<BlogEntity> {
    const category = await this.categoryService.findOne(createBlogDto.categoryId)
    if(!category) throw new NotFoundException('CATEGORY NOT FOUND ')
    const blog  =  this.blogRepository.create({
      ...createBlogDto ,
      user:currentUser,
      category
    })
    if(currentUser.id != blog.user.id) throw new ForbiddenException('YOU DONT HAVE PERMISSION TO CREATE A BLOG')
    try {
      const save = await this.blogRepository.save(blog)
      return save
    } catch (error) {
      throw new InternalServerErrorException('Failed to save the blog. Please try again.')
    }
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
    try {
      const blog = await this.blogRepository.findOne({
        where:{id},
        relations:{
          user:true ,
          category:true
        }
        ,
        select:['comment','id','description','createdAt','updatedAt','user','title','image']

      })
      if(!blog) throw new NotFoundException('BLOG NOT FOUND')
      return blog;
    } catch (error) {
      console.log('error' + new BadRequestException())
    }
  }
  async findAll(query:filterBlogDto) {
    const item_per_page  = query.item_per_page || 10 
    const page = Number(query.page) || 1 ;
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
      select:['category','comment','createdAt','description','id','image','title','updatedAt','user']
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

  remove(id: number) {
    return `This action removes a #${id} blog`;
  }
}
