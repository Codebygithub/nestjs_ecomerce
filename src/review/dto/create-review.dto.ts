import { IsNotEmpty, IsNumber, IsSemVer, IsString } from "class-validator";

export class CreateReviewDto {

    @IsNotEmpty()
    @IsNumber()
    productId:number;

    @IsNotEmpty()
    @IsNumber()
    ratings: number;

    @IsNotEmpty()
    @IsString()
    comment:string

}
