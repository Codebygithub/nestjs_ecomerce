import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class ApiKeyEntity {
    @PrimaryGeneratedColumn()
    id:string

    @Column()
    key:string

    @Column({default:true})
    status:boolean
}
