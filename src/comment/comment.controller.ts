import { Controller, Post, Body, UseGuards, Delete, Query, Param, Get } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentService } from './comment.service';
import { CurrentUser } from 'src/utility/decorators/currentUser.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { Roles } from 'src/utility/common/user-role.enum';
import { AuthorizeRoles } from 'src/utility/decorators/authorize-role.decorator';
import { AuthenticationGuard } from 'src/utility/guard/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guard/authorization.guard';
import { FilterCommentDto } from './dto/filter-comment.dto';
import { CommentEntity } from './entities/comment.entity';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService:CommentService) {}

  @Post()
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async createComment(@Body()createCommentDto:CreateCommentDto , @CurrentUser() currentUser:UserEntity):Promise<CommentEntity> {
    return await this.commentService.creatComment(createCommentDto,currentUser)
  }

  @Delete()
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async deleteComments(@Body() filterCommentDto :FilterCommentDto , @CurrentUser() currentUser:UserEntity){
   return await this.commentService.deleteComments(filterCommentDto,currentUser)
  }

  @Get()
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async getCommentByParentId(@Query() filterCOmmentDto:FilterCommentDto ):Promise<CommentEntity[]> {
    const res = await this.commentService.getAllCommentById(filterCOmmentDto)
    return res
  }

  
}
