import { IsArray, IsNotEmpty, IsString, Length, Matches } from "class-validator";

export class CreateBlogDto {
    @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
    @IsString({ message: 'Tiêu đề phải là một chuỗi ký tự' })
    @Length(10, 100, { message: 'Tiêu đề phải có độ dài từ 10 đến 100 ký tự' })
    title:string ;
    @IsNotEmpty()
    description:string;
    comment:string;
    @IsNotEmpty()
    @IsArray()
    image:string[]
    categoryId:number;
}
