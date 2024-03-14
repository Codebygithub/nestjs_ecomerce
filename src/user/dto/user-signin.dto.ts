import { IsNotEmpty, IsEmail, MinLength } from "class-validator";
export class signinDto{
    
    @IsNotEmpty({message:"Email can not null"})
    @IsEmail({},{message:"Email should be valid"})
    email:string;

    @IsNotEmpty()
    @MinLength(5,{message:"minimum charater is 5 "})
    password:string
}