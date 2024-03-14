import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class signupDto{
    @IsNotEmpty({message:"Name can not null"})
    @IsString({message:"Name should be string"})
    name:string;

    @IsNotEmpty({message:"Email can not null"})
    @IsEmail({},{message:"Email should be valid"})
    email:string;

    @IsNotEmpty()
    @MinLength(5,{message:"minimum charater is 5 "})
    password:string

    avatar:string
}