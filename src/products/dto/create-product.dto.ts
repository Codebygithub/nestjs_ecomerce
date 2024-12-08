import { IsArray, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CreateProductDto {

    @IsNotEmpty()
    @IsString()
    title:string

    @IsNotEmpty()
    @IsString()
    description:string

    @IsNotEmpty()
    @IsNumber({maxDecimalPlaces:2})
    price:number

    @IsNotEmpty()
    @Min(0)
    stock:number

    @IsNotEmpty()
    @IsArray()
    image:string[]

    @IsNotEmpty()
    @IsNumber()
    categoryId:number
    
    
    inventoryId:string
}
