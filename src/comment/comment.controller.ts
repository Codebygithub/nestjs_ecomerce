import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentService } from './comment.service';
import { CurrentUser } from 'src/utility/decorators/currentUser.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { Roles } from 'src/utility/common/user-role.enum';
import { AuthorizeRoles } from 'src/utility/decorators/authorize-role.decorator';
import { AuthenticationGuard } from 'src/utility/guard/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guard/authorization.guard';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService:CommentService) {}

  @Post()
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async createComment(@Body()createCommentDto:CreateCommentDto , @CurrentUser() currentUser:UserEntity) {
    return await this.commentService.creatComment(createCommentDto,currentUser)
  }
  
}
