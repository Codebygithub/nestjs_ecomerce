import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class createUserDto{
    name:string;
    email:string;
    password:string
    avatar:string;
}