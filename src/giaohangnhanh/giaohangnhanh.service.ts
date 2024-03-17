import { Body, Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateGiaohangnhanhDto } from './dto/create-giaohangnhanh.dto';
import { cancelDto } from './dto/cancel-giaohangnhanh.dto';
import { ProductsService } from 'src/products/products.service';
@Injectable()
export class GiaohangnhanhService {
  constructor(private readonly httpService: HttpService,
              private readonly productService:ProductsService
    ) {}

  async create(createGiaohangnhanhDto:CreateGiaohangnhanhDto,id:number): Promise<any> {

    const product = await this.productService.findOne(id)
    if(!product) throw new NotFoundException('PRODUCT NOT FOUND')
    const data = {
      payment_type_id: createGiaohangnhanhDto.payment_type_id,
      note: createGiaohangnhanhDto.note,
      required_note: createGiaohangnhanhDto.required_note,
      return_phone: createGiaohangnhanhDto.return_phone,
      return_address: createGiaohangnhanhDto.return_address,
      return_district_id: createGiaohangnhanhDto.return_district_id,
      return_ward_code: createGiaohangnhanhDto.return_ward_code,
      client_order_code: createGiaohangnhanhDto.client_order_code,
      from_name: createGiaohangnhanhDto.from_name,
      from_phone: createGiaohangnhanhDto.from_phone,
      from_address: createGiaohangnhanhDto.from_address,
      from_ward_name: createGiaohangnhanhDto.from_ward_name,
      from_district_name: createGiaohangnhanhDto.from_district_name,
      from_province_name: createGiaohangnhanhDto.from_province_name,
      to_name: createGiaohangnhanhDto.to_name,
      to_phone: createGiaohangnhanhDto.to_phone,
      to_address: createGiaohangnhanhDto.to_address,
      to_ward_name: createGiaohangnhanhDto.to_ward_name,
      to_district_name: createGiaohangnhanhDto.to_district_name,
      to_province_name: createGiaohangnhanhDto.to_province_name,
      cod_amount: createGiaohangnhanhDto.cod_amount,
      content:createGiaohangnhanhDto.content,
      weight: createGiaohangnhanhDto.weight,
      length: createGiaohangnhanhDto.length,
      width: createGiaohangnhanhDto.width,
      height: createGiaohangnhanhDto.height,
      cod_failed_amount: createGiaohangnhanhDto.cod_failed_amount,
      pick_station_id: createGiaohangnhanhDto.pick_station_id,
      deliver_station_id: createGiaohangnhanhDto.deliver_station_id,
      insurance_value: createGiaohangnhanhDto.insurance_value,
      service_id: createGiaohangnhanhDto.service_id,
      service_type_id: createGiaohangnhanhDto.service_type_id,
      coupon: createGiaohangnhanhDto.coupon,
      pickup_time:createGiaohangnhanhDto.pickup_time,
      pick_shift: createGiaohangnhanhDto.pick_shift,
      items: [
        {
        
          name: createGiaohangnhanhDto.Itemsname,
          code: createGiaohangnhanhDto.Itemscode,
          quantity: createGiaohangnhanhDto.Itemsquantity,
          price:createGiaohangnhanhDto.Itemsprice,
          length: createGiaohangnhanhDto.Itemslength,
          width: createGiaohangnhanhDto.Itemswidth,
          weight: createGiaohangnhanhDto.Itemsweight,
          height: createGiaohangnhanhDto.Itemsheight,
          category: {
            level1: '1'
          },
        },
      ],
    };

    try {
      const response = await this.httpService.post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create',
        data,
        {
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            token: '9229f01f-dab5-11ee-a6e6-e60958111f48',
            shopid: '190974',
            'User-Agent': 'axios/1.6.7',
          },
        },
      ).toPromise();
      return response.data;
    } catch (error) {
      // Handle error 
      console.error('Error creating shipping order:', error.response.data);
      throw error;
    }
  }
  async getProvince(){
    const urlApi = 'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province'
    try {
      const response  = await this.httpService.get(urlApi,{
        headers:{
          token:'9229f01f-dab5-11ee-a6e6-e60958111f48',
          'User-Agent': 'axios/1.6.7',
        }
      }).toPromise()
      return response.data
      
    } catch (error) {
      console.error('Error creating shipping order:', error.response.data);
      throw error;
      
    }
  }

  async cancel(cancelDto:cancelDto,id:number){
    const product = await this.productService.findOne(id)
    if(!product) throw new NotFoundException('PRODUCT NOT FOUND')

    const data = {
      order_codes:cancelDto.order_codes
    }

    try {
      const url = 'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/switch-status/cancel'
      const response = await this.httpService.post(url,data,{
        headers:{
          token:'9229f01f-dab5-11ee-a6e6-e60958111f48',
          'User-Agent': 'axios/1.6.7',
          shop_id:'190974',
          Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
        }
      }

    ).toPromise()
      
    return response.data
  
    } catch (error) {
      console.log(error)
    }



  }

  async getDistrict(){
    const urlApi = 'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district'
    try {
      const response  = await this.httpService.get(urlApi,{
        headers:{
          token:'9229f01f-dab5-11ee-a6e6-e60958111f48',
          'User-Agent': 'axios/1.6.7',
        }
      }).toPromise()
      return response.data
      
    } catch (error) {
      console.error('Error creating shipping order:', error.response.data);
      throw error;
      
    }
  }

  
}
