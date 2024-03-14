import { ProductEntity } from "src/products/entities/product.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";

@Entity()
export class ReviewEntity {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    ratings:number;

    @Column()
    comment:string;

    @CreateDateColumn()
    createdAt:Timestamp;

    @UpdateDateColumn()
    updatedAt:Timestamp;

    @ManyToOne(type=>UserEntity , (user)=> user.reviews)
    user:UserEntity

    @ManyToOne(()=>ProductEntity,(prod)=>prod.reviews)
    products:ProductEntity
}
