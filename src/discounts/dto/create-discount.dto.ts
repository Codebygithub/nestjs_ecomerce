import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Timestamp } from "typeorm";

export class CreateDiscountDto {

    @IsNotEmpty()
    @IsNumber()
    value:number;

    @IsNotEmpty()
    @IsString()
    code:string;
    
    @IsNotEmpty()
    startDate:Date;

    @IsNotEmpty()
    endDate:Date;

    @IsNotEmpty()
    maxUses:number;

    @IsNotEmpty()
    @IsNumber()
    minimumAmount:number
    @IsNotEmpty()
    @IsString()
    description:string

}
