import { UserEntity } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class ContactEntity {
    @PrimaryGeneratedColumn()
    id:number 

    @Column()
    name:string;

    @Column()
    email:string;

    @Column()
    message:string

    @CreateDateColumn()
    createdAt:Date

    @UpdateDateColumn()
    updatedAt:Date

    @ManyToOne(()=> UserEntity , (user) => user.contact)
    userContact:UserEntity
}
