import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateShippingDto {
    @IsString()
    @IsNotEmpty()
    phone:string;

    @IsOptional()
    @IsString()
    name:string;

    @IsNotEmpty()
    @IsString()
    address:string;

    @IsNotEmpty()
    @IsString()
    city: string;

    @IsString()
    @IsNotEmpty()
    postCode:string;

    @IsString()
    @IsNotEmpty()
    state:string;

    @IsString()
    @IsNotEmpty()
    country:string;

}