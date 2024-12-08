import { ProductEntity } from "src/products/entities/product.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";

@Entity()
export class InventoryEntity {

    @PrimaryGeneratedColumn()
    id:string

    @Column({default:'unknown'})
    location:string

    @Column({nullable:false})
    stock:number

    @Column('simple-array')
    reservations:string[]

    @CreateDateColumn()
    createdAt:Timestamp;
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @ManyToOne(()=> UserEntity,user =>user.inventories ,{nullable:false})
    user:UserEntity

    @ManyToMany(() => ProductEntity, product => product.inventories)
    @JoinTable() // Dùng @JoinTable ở phía chủ sở hữu.
    products: ProductEntity[];




}
