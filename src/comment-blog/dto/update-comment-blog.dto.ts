import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentBlogDto } from './create-comment-blog.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCommentBlogDto  {
    @IsNotEmpty()
    content:string

}
