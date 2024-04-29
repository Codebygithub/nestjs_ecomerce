import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { CommentBlogService } from './comment-blog.service';
import { CreateCommentBlogDto } from './dto/create-comment-blog.dto';
import { UpdateCommentBlogDto } from './dto/update-comment-blog.dto';
import { Roles } from 'src/utility/common/user-role.enum';
import { AuthorizeRoles } from 'src/utility/decorators/authorize-role.decorator';
import { AuthenticationGuard } from 'src/utility/guard/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guard/authorization.guard';
import { filterCommentBlogDto } from './dto/filter-comment-blog.dto';
import { CommentEntity } from './entities/comment-blog.entity';
import { createReplyCommentBlogDto } from './dto/create-replyCommentBlog.dto';

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

  @Get('get-comment')
  async findAll(@Query() filterCommentBlogDto:filterCommentBlogDto ):Promise<CommentEntity[]> {
    const res =await  this.commentBlogService.getComment(filterCommentBlogDto);
    return res
  }
  @Post(':commentId/reply')
  @AuthorizeRoles(Roles.USER, Roles.ADMIN)
  @UseGuards(AuthenticationGuard, AuthorizeGuard)
  async replyToComment(
    @Param('commentId') commentId: string,
    @Body() CreateReplyCommentBlogDto: createReplyCommentBlogDto
  ): Promise<CommentEntity | undefined> {
    // Attempt to convert commentId to a number
    console.log('commentID' , commentId)
    const numericCommentId = parseInt(commentId);
  
    if (isNaN(numericCommentId)) {
      // Handle invalid commentId (e.g., return an error response)
      throw new Error('Invalid comment ID: Please provide a valid number.');
    }
  
    const res = await this.commentBlogService.replyToComment(numericCommentId, CreateReplyCommentBlogDto);
    return res;
  }

  @Get(':id')
  async findOne(@Param('id') id: string):Promise<CommentEntity> {
    const res =await this.commentBlogService.findOne(+id)
    return res
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentBlogDto: UpdateCommentBlogDto) {
    return this.commentBlogService.update(+id, updateCommentBlogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentBlogService.remove(+id);
  }
}
