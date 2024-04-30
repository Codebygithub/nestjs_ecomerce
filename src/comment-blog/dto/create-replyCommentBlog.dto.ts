import { BlogEntity } from "src/blog/entities/blog.entity"
import { UserEntity } from "src/user/entities/user.entity"

export class CreateReplyCommentBlogDto {
    content:string
    userId:UserEntity
    blogId:BlogEntity
}