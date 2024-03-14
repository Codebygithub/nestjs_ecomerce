import { Type } from "class-transformer"
import { createShippingDto } from "./create-shipping.dto"
import { ValidateNested } from "class-validator"
import { OrderProductDto } from "./order-product.dto";

export class CreateOrderDto {

    @Type(()=>createShippingDto)
    @ValidateNested()
    shippingAddress:createShippingDto;

    @Type(()=>OrderProductDto)
    @ValidateNested()
    orderedProducts:OrderProductDto[]
}
