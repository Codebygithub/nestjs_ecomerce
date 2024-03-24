import { IsNotEmpty } from "class-validator";
import { UserEntity } from "src/user/entities/user.entity";

export class saveDiscountDto {
    @IsNotEmpty()
    code:string ;

    @IsNotEmpty()
    userId:UserEntity
}