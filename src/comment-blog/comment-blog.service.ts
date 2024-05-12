import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException, Post, UnauthorizedException } from '@nestjs/common';
import { CreateCommentBlogDto } from './dto/create-comment-blog.dto';
import { UpdateCommentBlogDto } from './dto/update-comment-blog.dto';
import { Connection, Repository } from 'typeorm';
import { CommentEntity } from './entities/comment-blog.entity';
import { UserService } from 'src/user/user.service';
import { BlogService } from 'src/blog/blog.service';
import { InjectRepository } from '@nestjs/typeorm';
import { filterCommentBlogDto } from './dto/filter-comment-blog.dto';
import { Like } from 'typeorm';
import { CreateReplyCommentBlogDto } from './dto/create-replyCommentBlog.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { EditHistoryEntity } from './entities/editHistoryComment-blog.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { query } from 'express';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class CommentBlogService {
  constructor(
              @InjectRepository(CommentEntity) private readonly commentBlogRepository:Repository<CommentEntity>,
              @InjectRepository(EditHistoryEntity) private readonly EditRepo:Repository<EditHistoryEntity>,
              private readonly userService:UserService ,
              private readonly blogService:BlogService,
              @Inject(CACHE_MANAGER) private cacheManager:Cache ,
              private readonly connection:Connection,
              @InjectQueue('comment-blog') private readonly commentQueue:Queue
  ){}

  async createCommentBlog(createCommentBlogDto: CreateCommentBlogDto,blogId:number,userId:number) {
    const res =await this.commentQueue.add('createCommentBlog',{createCommentBlogDto,blogId,userId},{
      removeOnFail : true,
      removeOnComplete:true
    })
    return res
  }

  async getComment(filterCommentBlogDto:filterCommentBlogDto):Promise<CommentEntity[]> {
    const items_per_page = Number(filterCommentBlogDto.item_per_page) || 10;
    const page = Number(filterCommentBlogDto.page) || 1;
    const skip = (page - 1) * items_per_page;
    const keyword = filterCommentBlogDto.keyword || '';
    const cacheKey = `comments:${keyword}:${page}`;
    const cachedComments = await this.cacheManager.get(cacheKey);
    if(cachedComments) {
      return JSON.parse(cachedComments as string)
    }
    let query = await this.commentBlogRepository.createQueryBuilder('comment')
    .leftJoinAndSelect('comment.user', 'user')
    .leftJoinAndSelect('comment.blog', 'blog')
    .leftJoinAndSelect('comment.replies', 'reply') // Lấy các replies của mỗi comment
    .where('comment.parentComment IS NULL') // Chỉ lấy các comment không phải là replies
    .orderBy('comment.createdAt', 'DESC')
    .skip(skip)
    .take(items_per_page)
    // .select(['comment.id', 'comment.content', 'comment.createdAt', 'user.username', 'blog.title'])
    if(keyword)
      {
        query = query.where('comment.content Like :keyword',{keyword:`%${keyword}%`});

      }

    const comments =  await query.getMany()
    await this.cacheManager.set(cacheKey,JSON.stringify(comments),3600)
    return comments
    
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

  
  async update(id: number, updateCommentBlogDto: UpdateCommentBlogDto,currentUser:UserEntity) {
    const {content}  = updateCommentBlogDto
    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      const comment = await queryRunner.manager.findOne(CommentEntity,{
        where : {id},
        relations:{user:true , blog:true , editHistory:true}
      });
      if(!comment)
        {
          queryRunner.rollbackTransaction()
          throw new NotFoundException('COMMENT NOT FOUND')
        }
        if (currentUser.id !== comment.user.id) {
          await queryRunner.rollbackTransaction();
          throw new UnauthorizedException("You Don't Have Permission To Perform This Action");
      }

      if (comment.updateCount >= 3) {
          await queryRunner.rollbackTransaction();
          throw new ForbiddenException("YOU HAVE EXCEED THE MAXIMUM ALLOWED UPDATES FOR THIS COMMENT");
      }

      const newEditHistoryComment = new EditHistoryEntity();
      newEditHistoryComment.editedBy = currentUser.name;
      newEditHistoryComment.editedAt = new Date();
      newEditHistoryComment.previousContent = comment.content;
      newEditHistoryComment.newContent = content;

      if(!comment.editHistory) {
        comment.editHistory = [newEditHistoryComment]
      }
      else{
          comment.editHistory = [newEditHistoryComment,...comment.editHistory.slice(0,9)]
      }
      await queryRunner.manager.save(EditHistoryEntity,newEditHistoryComment)
      comment.content = content 
      comment.updateCount++

      const save = await queryRunner.manager.save(comment)
      await queryRunner.commitTransaction()
      return save
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error;
    }
    finally{
      await queryRunner.release();
    }
  

  }
  

  async deleteComment(commentId: number,currentUser:UserEntity): Promise<void> {
    // Tìm bình luận
    await this.commentQueue.add('deleteCommentBlog',{commentId,currentUser},{
      removeOnComplete:true,
      removeOnFail:true
    })
  }
}
