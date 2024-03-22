import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { DiscountEntity } from './entities/discount.entity';
import { AuthorizeRoles } from 'src/utility/decorators/authorize-role.decorator';
import { Roles } from 'src/utility/common/user-role.enum';
import { AuthenticationGuard } from 'src/utility/guard/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guard/authorization.guard';
import { CurrentUser } from 'src/utility/decorators/currentUser.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { ApplyDiscountDto } from './dto/apply-discount.dto';

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
  @AuthorizeRoles(Roles.ADMIN)  
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async createDiscount(@Body()discountData:CreateDiscountDto , @CurrentUser() currentUser:UserEntity): Promise<DiscountEntity>{
    const res = await this.discountsService.createDiscount(discountData,currentUser)
    return res
  }

  @Get('checkAvailable/:userId/:code')
  async checkAvailableForUser(@Param('userId') userId:number , @Param('code') code:string){
    const res = await this.discountsService.checkDiscountAvailableForUser(+userId,code)
    return res
  }
  @Post('use/:code')
  async countDiscount(@Param('code') code: string): Promise<DiscountEntity> {
    const res = await  this.discountsService.CountDiscount(code);
    return res
  }

  @Post('apply')
  async applyDiscount(@Body() applyDiscoutDto:ApplyDiscountDto) {
    const discount = await this.discountsService.applyDiscount(applyDiscoutDto);
    return discount
  }


  @Get('user/:code')
  async userUseDiscount(@Param('code') code:string )
  {
    const res=  await this.discountsService.userUseDiscount(code,)
    return res
  }

 
}
