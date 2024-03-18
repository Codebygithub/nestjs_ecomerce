import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get(':code')
  async getDiscountByCode(@Param('code') code:string){
    const isvalid = await this.discountsService.isDiscountValid(code)
    if(isvalid) {
      const discount = await this.discountsService.getDiscountByCode(code)
      return discount
    }
    else{
      return {msg:'Discount code is not valid or has expired' }
    }
  }
  
 
}
