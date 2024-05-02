
import { BlogEntity } from "src/blog/entities/blog.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from "typeorm";

@Entity()
export class CommentEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @Column({default:0})
    updateCount:number

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => UserEntity, (user) => user.comments)
    user: UserEntity;

    @ManyToOne(() => BlogEntity, (blog) => blog.comments)
    blog: BlogEntity;

    @ManyToOne(() => CommentEntity, (comment) => comment.replies, { nullable: true })
    parentComment: CommentEntity;

    @OneToMany(() => CommentEntity, (comment) => comment.parentComment)
    replies: CommentEntity[];
}
