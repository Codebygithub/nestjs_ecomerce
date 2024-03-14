import { UserEntity } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ChatEntity {

    @PrimaryGeneratedColumn()
    id:number ;

    @Column()
    email:string; 

    @Column()
    text:string;

    @ManyToOne(() => UserEntity, user => user.chats)
    user: UserEntity;

    @CreateDateColumn()
    createdAt:Date

}
