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

    @Column({nullable:true})
    phone:number

    @Column()
    message:string

    @Column({default:0})
    contactCount:number

    @CreateDateColumn()
    createdAt:Date

    @UpdateDateColumn()
    updatedAt:Date

    @Column({type:'timestamp',nullable:true})
    retrievedAt:Date

    @ManyToOne(()=> UserEntity , (user) => user.contact)
    userContact:UserEntity
}
