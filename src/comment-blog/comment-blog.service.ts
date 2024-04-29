import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentBlogDto } from './dto/create-comment-blog.dto';
import { UpdateCommentBlogDto } from './dto/update-comment-blog.dto';
import { Repository } from 'typeorm';
import { CommentEntity } from './entities/comment-blog.entity';
import { UserService } from 'src/user/user.service';
import { BlogService } from 'src/blog/blog.service';
import { InjectRepository } from '@nestjs/typeorm';
import { filterCommentBlogDto } from './dto/filter-comment-blog.dto';
import { Like } from 'typeorm';
import { createReplyCommentBlogDto } from './dto/create-replyCommentBlog.dto';

@Injectable()
export class CommentBlogService {
  constructor(
              @InjectRepository(CommentEntity) private readonly commentBlogRepository:Repository<CommentEntity>,
              private readonly userService:UserService ,
              private readonly blogService:BlogService
  ){}

  async createCommentBlog(createCommentBlogDto: CreateCommentBlogDto,blogId:number,userId:number) {
    const user = await this.userService.findOne(userId)
    console.log('user',user)
    if(!user) throw new NotFoundException('USER NOT FOUND')
    const blog = await this.blogService.findOne(blogId)
    console.log('blog',blog)
    if(!blog) throw new NotFoundException('BLOG NOT FOUND')
    const newComment = await this.commentBlogRepository.create({
    content:createCommentBlogDto.content,
    user,
    blog
    })
    const saved = await this.commentBlogRepository.save(newComment)
    return saved 
  }

  async getComment(filterCommentBlogDto:filterCommentBlogDto):Promise<CommentEntity[]> {
    const items_per_page = Number(filterCommentBlogDto.item_per_page) || 10;
    const page = Number(filterCommentBlogDto.page) || 1;
    const skip = (page - 1) * items_per_page;
    const keyword = filterCommentBlogDto.keyword || '';
    let query = await this.commentBlogRepository.createQueryBuilder('comment')
    .leftJoinAndSelect('comment.user', 'user')
    .leftJoinAndSelect('comment.blog', 'blog')
    .leftJoinAndSelect('comment.replies', 'reply') // Lấy các replies của mỗi comment
    .where('comment.parentComment IS NULL') // Chỉ lấy các comment không phải là replies
    .orderBy('comment.createdAt', 'DESC')
    .skip(skip)
    .take(items_per_page);
    if(keyword)
      {
        query = query.where('comment.content Like :keyword',{keyword:`%${keyword}%`});

      }

    return await query.getMany()
    
  }
  async replyToComment(commentId:number ,CreateReplyCommentBlogDto:createReplyCommentBlogDto):Promise<CommentEntity> {
    const comment = await this.findOne(commentId)
    if(!comment) throw new NotFoundException()
    const reply = new CommentEntity()
    reply.content=CreateReplyCommentBlogDto.content
    reply.parentComment = comment
    return this.commentBlogRepository.save(reply)

  }

  async findOne(id: number):Promise<CommentEntity> {
    const comment = await this.commentBlogRepository.findOne({
      where:{id} ,
      relations:{user:true , blog:true},
      select:['blog' , 'content', 'createdAt' , 'id' ,'parentComment','replies' ,'updatedAt','user']

    })
    if(!comment) throw new NotFoundException('COMMENT NOT FOUND')
    return comment
  }

  update(id: number, updateCommentBlogDto: UpdateCommentBlogDto) {
    return `This action updates a #${id} commentBlog`;
  }

  remove(id: number) {
    return `This action removes a #${id} commentBlog`;
  }
}
