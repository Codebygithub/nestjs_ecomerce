import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BlogEntity } from "./blog.entity";

@Entity()
export class topicBlogEntity {
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    name:string;

    @ManyToOne(()=> BlogEntity, (blog) => blog.topics)
    blog:BlogEntity[]
}