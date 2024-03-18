import { OrderEntity } from "src/order/entities/order.entity"

export class cancelDto {
    order_codes:string
    orderId:OrderEntity
}