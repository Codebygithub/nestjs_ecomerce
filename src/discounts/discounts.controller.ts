import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { DiscountEntity } from './entities/discount.entity';

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
  
  @Post('create-discount')
  async createDiscount(@Body()discountData:CreateDiscountDto): Promise<DiscountEntity>{
    const res = await this.discountsService.createDiscount(discountData)
    return res
  }

  @Get('checkAvailable/:userId/:code')
  async checkAvailableForUser(@Param('userId') userId:number , @Param('code') code:string){
    const res = await this.discountsService.checkDiscountAvailableForUser(+userId,code)
    return res
  }
  @Post('use/:code')
  async countDiscount(@Param('code') code: string): Promise<void> {
    await this.discountsService.CountDiscount(code);
  }

  @Get('user/:code')
  async userUseDiscount(@Param('code') code:string)
  {
    const res=  await this.discountsService.userUseDiscount(code)
    return res
  }

 
}
