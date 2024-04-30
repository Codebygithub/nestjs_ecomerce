import { BadRequestException, Injectable, NotFoundException, Post } from '@nestjs/common';
import { CreateCommentBlogDto } from './dto/create-comment-blog.dto';
import { UpdateCommentBlogDto } from './dto/update-comment-blog.dto';
import { Repository } from 'typeorm';
import { CommentEntity } from './entities/comment-blog.entity';
import { UserService } from 'src/user/user.service';
import { BlogService } from 'src/blog/blog.service';
import { InjectRepository } from '@nestjs/typeorm';
import { filterCommentBlogDto } from './dto/filter-comment-blog.dto';
import { Like } from 'typeorm';
import { CreateReplyCommentBlogDto } from './dto/create-replyCommentBlog.dto';
import { UserEntity } from 'src/user/entities/user.entity';

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
  async replyComment(commentId:number , userId:number , blogId:number , createReplyCommentBlogDto:CreateReplyCommentBlogDto,currentUser:UserEntity) {
    const {content} = createReplyCommentBlogDto
    const user = await this.userService.findOne(userId)
    if(!user) throw new NotFoundException()
    const blog = await this.blogService.findOne(blogId)
    if(!blog) throw new NotFoundException()
    const comment = await this.commentBlogRepository.findOne({
      where:{id:commentId},
      relations:{replies:true}
    })
    if(!comment) throw new NotFoundException("COMMENT NOT FOUND")
    const reply = new CommentEntity()
    reply.content = content
    reply.user=user 
    reply.blog=blog
    reply.parentComment = comment
    comment.replies.push(reply)
    const save = await this.commentBlogRepository.save(reply)
    return save
    

    
  }


  async findUserAndBlog(blogId:number , userId:number){
    return await this.commentBlogRepository.findOne({
      where:{
        user:{
          id:userId
        },
        blog:{
          id:blogId
        }
      },
      relations:{
        user:true,
        blog:true
      }
      
    })
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
