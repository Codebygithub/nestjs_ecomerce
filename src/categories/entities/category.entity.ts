import { ProductEntity } from "src/products/entities/product.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";

@Entity({name:'categories'})
export class CategoryEntity {
    @PrimaryGeneratedColumn()
    id:number;
    
    @Column()
    title:string;

    @Column()
    description:string ; 

    @CreateDateColumn()
    createdAt:Timestamp ;

    @UpdateDateColumn()
    updateAt:Timestamp; 

    @ManyToOne(()=>UserEntity , (user)=> user.categories)
    addedBy:UserEntity

    @OneToMany(()=>ProductEntity,(prod)=>prod.category)
    products:ProductEntity[]


}
