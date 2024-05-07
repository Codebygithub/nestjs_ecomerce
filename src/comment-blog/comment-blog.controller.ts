import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, BadRequestException, UsePipes, ValidationPipe, ParseIntPipe, Put, UseInterceptors } from '@nestjs/common';
import { CommentBlogService } from './comment-blog.service';
import { CreateCommentBlogDto } from './dto/create-comment-blog.dto';
import { UpdateCommentBlogDto } from './dto/update-comment-blog.dto';
import { Roles } from 'src/utility/common/user-role.enum';
import { AuthorizeRoles } from 'src/utility/decorators/authorize-role.decorator';
import { AuthenticationGuard } from 'src/utility/guard/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guard/authorization.guard';
import { filterCommentBlogDto } from './dto/filter-comment-blog.dto';
import { CommentEntity } from './entities/comment-blog.entity';
import { CreateReplyCommentBlogDto } from './dto/create-replyCommentBlog.dto';
import { GetIntParam } from 'src/utility/decorators/getParamInt.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { CurrentUser } from 'src/utility/decorators/currentUser.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('comment-blog')
export class CommentBlogController {
  constructor(private readonly commentBlogService: CommentBlogService) {}

  @Post(':blogId/:userId')
  @AuthorizeRoles(Roles.USER,Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)  
  async create(@Body() createCommentBlogDto: CreateCommentBlogDto , @Param('blogId') blogId:string , @Param('userId') userId:string ) {
    const res = await this.commentBlogService.createCommentBlog(createCommentBlogDto , +blogId,+userId)
    return res
    
  }
  @Post('comments/:commentId/:userId/:blogId/replies')
  async replyComment(@Param('commentId') commentId:string  ,@Param('userId') userId:string ,@Param('blogId') blogId:string ,@Body() createReplyCommentBlogDto:CreateReplyCommentBlogDto , currentUser:UserEntity) {
    const res = await this.commentBlogService.replyComment(+commentId ,+userId,+blogId, createReplyCommentBlogDto,currentUser)
    return res
  }

  @Get('get-comment')
  @AuthorizeRoles(Roles.USER,Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)  
  @UseInterceptors(CacheInterceptor)
  async findAll(@Query() filterCommentBlogDto:filterCommentBlogDto ):Promise<CommentEntity[]> {
    const res =await  this.commentBlogService.getComment(filterCommentBlogDto);
    return res
  }



  @Get(':id')
  async findOne(@Param('id') id: string):Promise<CommentEntity> {
    const res =await this.commentBlogService.findOne(+id)
    return res
  }

  @Put(':id/update-comment')
  @AuthorizeRoles(Roles.USER,Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async update(@Param('id') id: string, @Body() updateCommentBlogDto: UpdateCommentBlogDto,@CurrentUser() currentUser:UserEntity) {
    const res = await this.commentBlogService.update(+id, updateCommentBlogDto, currentUser)
    console.log('id', id)
    return res
  }

  @Delete(':id')
  @AuthorizeRoles(Roles.USER,Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async remove(@Param('id') id: string,@CurrentUser() currentUser:UserEntity) {
    const res = await this.commentBlogService.deleteComment(+id,currentUser);
    return res
  }
}
