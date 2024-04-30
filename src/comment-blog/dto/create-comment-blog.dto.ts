import { IsNotEmpty, IsString } from "class-validator";

export class CreateCommentBlogDto {
    @IsNotEmpty()
    @IsString()
    content:string;
}
