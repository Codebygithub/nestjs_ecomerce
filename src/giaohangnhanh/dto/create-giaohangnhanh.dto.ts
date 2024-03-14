import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class CreateGiaohangnhanhDto {
  payment_type_id:number;
  note:number;
  required_note:string = 'KHONGCHOXEMHANG';
  return_phone:string;
  return_address:string;
  return_district_id:string;
  return_ward_code:string;
  client_order_code:string
  from_name:string;
  from_phone:string;
  from_address:string;
  from_ward_name:string;
  from_district_name:string;
  from_province_name:string;
  to_name:string;
  to_phone:string;
  to_address:string;
  to_ward_name:string;
  to_district_name:string;
  to_province_name:string;
  cod_amount:number;
  content:string;
  weight:number;
  length:number;
  width:number;
  height:number;
  cod_failed_amount:number = 2000;
  pick_station_id:number = 1444;
  deliver_station_id:string;
  insurance_value:number;
  service_id:number = 0 ;
  service_type_id:number = 2 ;
  coupon: string;
  pickup_time:number;
  pick_shift:number[];
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];
   
  Itemsname:string ;
  Itemscode:string ;
  Itemsquantity:number;
  Itemsprice:number;
  Itemslength:number;
  Itemswidth:number;
  Itemsweight:number;
  Itemsheight:number;
  }

  
  
  

  class ItemDto {
    @IsNotEmpty()
    @IsString()
    name: string;
  
    @IsNotEmpty()
    @IsString()
    code: string;
  
    @IsNotEmpty()
    @IsNumber()
    quantity: number;
  
    @IsNotEmpty()
    @IsNumber()
    price: number;
  
    @IsNotEmpty()
    @IsNumber()
    length: number;
  
    @IsNotEmpty()
    @IsNumber()
    width: number;
  
    @IsNotEmpty()
    @IsNumber()
    weight: number;
  
    @IsNotEmpty()
    @IsNumber()
    height: number;
  
  }
  


