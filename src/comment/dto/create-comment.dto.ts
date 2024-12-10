import { IsString, IsInt, IsOptional, IsNotEmpty, IsUUID, IsNumber } from 'class-validator';

export class CreateCommentDto {
 productId:number
 userId:number
 content:string
 parentCommentId?: number

}
