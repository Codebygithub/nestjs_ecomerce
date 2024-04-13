import { IsArray, IsNotEmpty, IsString, Length, Matches } from "class-validator";

export class CreateBlogDto {
    @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
    @IsString({ message: 'Tiêu đề phải là một chuỗi ký tự' })
    @Length(10, 100, { message: 'Tiêu đề phải có độ dài từ 10 đến 100 ký tự' })
    @Matches(/^[a-zA-Z0-9 ]*$/, { message: 'Tiêu đề chỉ được chứa chữ cái, số và khoảng trắng' })
    title:string ;
    @IsNotEmpty()
    @Matches(/^[a-zA-Z0-9 ]*$/, { message: 'Tiêu đề chỉ được chứa chữ cái, số và khoảng trắng' })
    description:string;
    @IsNotEmpty()
    @Matches(/^[a-zA-Z0-9 ]*$/, { message: 'Tiêu đề chỉ được chứa chữ cái, số và khoảng trắng' })
    comment:string;
    @IsNotEmpty()
    @IsArray()
    image:string[]
    @IsNotEmpty()
    categoryId:number;
}
