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

@Injectable()
export class BlogService {
  constructor(@InjectRepository(BlogEntity) private readonly blogRepository:Repository<BlogEntity>,
                                            private readonly categoryService:CategoriesService,
                                            private readonly entitymanager:EntityManager)
  {}


  async create(createBlogDto: CreateBlogDto,currentUser:UserEntity):Promise<BlogEntity> {
    const category = await this.categoryService.findOne(createBlogDto.categoryId)
    if(!category) throw new NotFoundException('CATEGORY NOT FOUND ')
    if(currentUser.id != category.addedBy.id) throw new ForbiddenException('YOU DONT HAVE PERMISSION TO CREATE A BLOG')
    try {
      return this.entitymanager.transaction(async entityManager => {
        const blog = await this.entitymanager.create(BlogEntity,{
          ...createBlogDto,
          user:currentUser ,
          category
        })
        const saved = await entityManager.save(blog)
        return saved
      })
    } catch (error) {
      throw new InternalServerErrorException('FAILED TO SAVED THE BLOG , PLEASE TRY AGAIN ')
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
  async PopularTopic():Promise<{topic:string , count:number}[]> {
    const blogs = await this.blogRepository.find({
      relations:{user:true , topics:true , category:true}
    })
    if(!blogs) throw new NotFoundException('NOT FOUND')
      const topicCounts: Record<string, number> = {};
    for(const blog of blogs) {
      for(const topic of blog.topics) {
        if(topic.name in topicCounts) {
          topicCounts[topic.name] +=1

        }
        else {
          topicCounts[topic.name] = 1 
        }
      }
    }
    const PopularTopics = Object.keys(topicCounts).map((topic)=>({
      topic,
      count:topicCounts[topic]
    }))
    return PopularTopics.sort((a,b) =>b.count - a.count)
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