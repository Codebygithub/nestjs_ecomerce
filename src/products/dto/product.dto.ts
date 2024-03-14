import { Expose, Type } from "class-transformer";

export class productDto{
    @Expose()
    totalProducts:number;

    @Expose()
    limit:number;

    @Expose()
    @Type(()=>ProductsList) 
    product:ProductsList[]
}
export class ProductsList {
    @Expose({name:'product_id'})
    id:number

}