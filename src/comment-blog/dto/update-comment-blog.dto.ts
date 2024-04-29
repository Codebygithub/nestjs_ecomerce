import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentBlogDto } from './create-comment-blog.dto';

export class UpdateCommentBlogDto extends PartialType(CreateCommentBlogDto) {}
