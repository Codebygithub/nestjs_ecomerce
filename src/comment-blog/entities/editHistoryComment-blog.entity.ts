// edit-history.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { CommentEntity } from './comment-blog.entity';

@Entity()
export class EditHistoryEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    editedBy: string;

    @Column()
    editedAt: Date;

    @Column()
    previousContent: string;

    @Column()
    newContent: string;

    @ManyToOne(()=>CommentEntity , (cmt)=> cmt.editHistory)
    comment : CommentEntity  ;
}
