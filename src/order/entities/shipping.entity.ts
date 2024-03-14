import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderEntity } from "./order.entity";

@Entity()
export class ShippingEntity {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    phone:number;

    @Column({default:' '})
    name:string;

    @Column()
    address:string;

    @Column()
    city:string ;

    @Column()
    postCode:string;

    @Column()
    state:string;

    @Column()
    country:string;

    @OneToOne(()=>OrderEntity,(order)=> order.shippingAddress)
    order:OrderEntity

}