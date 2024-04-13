import { CategoryEntity } from "src/categories/entities/category.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, Index, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class BlogEntity {
    @PrimaryGeneratedColumn()
    id:number ;
    @Column()
    @Index()
    title:string; 
    @Column()
    description:string;
    @Column()
    comment:string;

    @Column('simple-array')
    image:string[]
    
    @CreateDateColumn()
    createdAt:Date;

    @UpdateDateColumn()
    updatedAt:Date;

    @ManyToOne(()=>UserEntity , (user)=>user.blog)
    user:UserEntity;

    @ManyToOne(()=>CategoryEntity , (cat) =>cat.blog)
    category:CategoryEntity


    
}
