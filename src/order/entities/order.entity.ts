import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { OrderStatus } from "../enum/order-status.enum";
import { UserEntity } from "src/user/entities/user.entity";
import { ShippingEntity } from "./shipping.entity";
import { OrderProductsEntity } from "./order-products.entity";

@Entity()
export class OrderEntity {
    @PrimaryGeneratedColumn()
    id:number;

    @CreateDateColumn()
    orderAt:Timestamp;

    @Column({type:'enum' , enum:OrderStatus , default:OrderStatus.PROCESSING})
    status:string;

    @Column({nullable:true})
    shippedAt:Date;

    @Column({nullable:true})
    deliveredAt:Date;

    @ManyToOne(()=>UserEntity , (user)=> user.ordersUpdateBy)
    updatedBy : UserEntity ;

    @OneToOne(()=>ShippingEntity,(ship)=>ship.order,{cascade:true})
    @JoinColumn()
    shippingAddress:ShippingEntity;

    @ManyToOne(()=>OrderProductsEntity , (op)=>op.order,{cascade:true})
    products:OrderProductsEntity[];

    @ManyToOne(()=>UserEntity,(user)=>user.orders)
    user:UserEntity;








}
