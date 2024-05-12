import { Process, Processor } from "@nestjs/bull";
import { Logger, NotFoundException } from "@nestjs/common";
import { Job } from "bull";
import { CreateCommentBlogDto } from "./dto/create-comment-blog.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { EditHistoryEntity } from "./entities/editHistoryComment-blog.entity";
import { CommentEntity } from "./entities/comment-blog.entity";
import { UserService } from "src/user/user.service";
import { BlogService } from "src/blog/blog.service";
import { Not, Repository } from "typeorm";

@Processor('comment-blog')
export class CommentWorker {
    constructor( @InjectRepository(CommentEntity) private readonly commentBlogRepository:Repository<CommentEntity>,
    @InjectRepository(EditHistoryEntity) private readonly EditRepo:Repository<EditHistoryEntity>,
    private readonly userService:UserService ,
    private readonly blogService:BlogService,){}

    private readonly logger = new Logger(CommentWorker.name)
    @Process('createCommentBlog')
    async handleCreateCommentBlog(job:Job){

        const {createCommentBlogDto,blogId,userId} = job.data
        const {content} = createCommentBlogDto
        
        const user = await this.userService.findOne(userId)
        console.log('user',user)
        if(!user) throw new NotFoundException('USER NOT FOUND')
        const blog = await this.blogService.findOne(blogId)
        console.log('blog',blog)
        if (!blog) throw new NotFoundException('BLOG NOT FOUND');
        const newComment = this.commentBlogRepository.create({
            content,
            user,
            blog
        })
        const save = await this.commentBlogRepository.save(newComment)
        this.logger.log(`PROCESSSING HANDLE CREATE COMMENT WITH DATA ${job.data}`)
        return save
    }
    @Process('deleteCommentBlog')
    async handleDeleteCommentBlog(job:Job){
        const {commentId , currentUser } = job.data
        const comment = await this.commentBlogRepository.findOne({
            where:{id:commentId} ,
            relations:{user:true , editHistory:true , blog:true}
        })
        if(!comment) throw new NotFoundException('COMMENT NOT FOUND')
        
        if (comment.editHistory && comment.editHistory.length > 0) {
                for (const editHistory of comment.editHistory) {
                  await this.EditRepo.delete(editHistory.id);
                }
              }
        comment.user = currentUser
        await this.commentBlogRepository.remove(comment)
        this.logger.log('Deleted comment' + commentId)
        
    }
}