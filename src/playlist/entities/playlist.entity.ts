import { PrimaryGeneratedColumn } from "typeorm";

export class PlaylistEntity {
    @PrimaryGeneratedColumn()
    id:string
    title:string
    description: string;


}
