import { Injectable, NotFoundException, Query } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { Repository } from 'typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { filterTitleDto } from './dto/filter-title.dto';

@Injectable()
export class BlogService {
  constructor(@InjectRepository(BlogEntity) private readonly blogRepository:Repository<BlogEntity>,
                                            private readonly categoryService:CategoriesService
  ){}


  async create(createBlogDto: CreateBlogDto,currentUser:UserEntity):Promise<BlogEntity> {
    const category = await this.categoryService.findOne(createBlogDto.categoryId)
    if(!category) throw new NotFoundException('CATEGORY NOT FOUND ')
    const blog = await this.blogRepository.create(createBlogDto)
    blog.user = currentUser 
    blog.category = category
    return  await this.blogRepository.save(blog)
  }

  async findByTitle(query:filterTitleDto):Promise<BlogEntity[]> {
    const title = query.title
    const blog = await this.blogRepository.find({
      where:{title}
    })
    return blog
  }
  findAll() {
    return `This action returns all blog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} blog`;
  }

  update(id: number, updateBlogDto: UpdateBlogDto) {
    return `This action updates a #${id} blog`;
  }

  remove(id: number) {
    return `This action removes a #${id} blog`;
  }
}
