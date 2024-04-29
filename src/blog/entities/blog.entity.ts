import { CategoryEntity } from "src/categories/entities/category.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, Index, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { topicBlogEntity } from "./topic-blog.entity";
import { CommentEntity } from "src/comment-blog/entities/comment-blog.entity";

@Entity()
export class BlogEntity {
    @PrimaryGeneratedColumn()
    id:number ;
    @Column()
    @Index()
    title:string; 
    @Column()
    description:string;
    
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

    @OneToMany(()=>topicBlogEntity , (tb) => tb.blog)
    topics:topicBlogEntity[]

    @OneToMany(()=>CommentEntity , (cmt) => cmt.blog)
    comments : CommentEntity[];

   
    
}
