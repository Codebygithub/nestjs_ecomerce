import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsString, Length, Matches, IsArray } from "class-validator";
import { CreateBlogDto } from "./create-blog.dto";

export class UpdateBlogDto extends PartialType(CreateBlogDto) {}
    


