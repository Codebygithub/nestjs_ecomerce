import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class OrderProductDto {

    @IsNotEmpty()
    id:number ;

    @IsNumber({maxDecimalPlaces:2})
    @IsPositive()
    product_unit_price:number;

    @IsNumber()
    @IsPositive()
    product_quantity:number
}