import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Query } from '@nestjs/common';
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
import { saveDiscountDto } from './dto/save-discount.dto';
import { DeleteSaveDiscountDto } from './dto/delete-Savediscount.dto';
import { filterDiscountDto } from './dto/filter-discount.dto';

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) { }


  @Delete(':id')
  @AuthorizeRoles(Roles.ADMIN,Roles.USER)
  @UseGuards(AuthenticationGuard, AuthorizeGuard)
  async deleteDiscount(@Param('id') id: number): Promise<DiscountEntity> {
    const discount = await this.discountsService.deleteDiscount(id)
    return discount


  }
  @Get(':code')
  @AuthorizeRoles(Roles.ADMIN,Roles.USER)
  @UseGuards(AuthenticationGuard, AuthorizeGuard)
  async getDiscountByCode(@Param('code') code: string) {
    const isvalid = await this.discountsService.isDiscountValid(code)
    if (isvalid) {
      const discount = await this.discountsService.getDiscountByCode(code)

      return discount
    }
    else {
      return { msg: 'Discount code is not valid or has expired' }
    }

  }

  @Put(':id')
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard, AuthorizeGuard)
  async updateDiscount(@Param('id') id: string, @Body() updateDiscountDto: UpdateDiscountDto, @CurrentUser() currentUser: UserEntity) {
    const discount = await this.discountsService.updateDiscount(+id, updateDiscountDto, currentUser)
    return discount

  }


  @Post('create-discount')
  @AuthorizeRoles(Roles.USER, Roles.ADMIN)
  @UseGuards(AuthenticationGuard, AuthorizeGuard)
  async createDiscount(@Body() discountData: CreateDiscountDto): Promise<DiscountEntity> {
    const res = await this.discountsService.createDiscount(discountData)
    return res
  }

  @Get('checkAvailable/:userId/:code')
  @AuthorizeRoles(Roles.ADMIN,Roles.USER)
  @UseGuards(AuthenticationGuard, AuthorizeGuard)
  async checkAvailableForUser(@Param('userId') userId: number, @Param('code') code: string) {
    const res = await this.discountsService.checkDiscountAvailableForUser(userId, code)
    return res
  }
  @Post('use/:code')
  async countDiscount(@Param('code') code: string): Promise<DiscountEntity> {
    const res = await this.discountsService.CountDiscount(code);
    return res
  }

  @Post('apply')
  @AuthorizeRoles(Roles.ADMIN,Roles.USER)
  @UseGuards(AuthenticationGuard, AuthorizeGuard)
  async applyDiscount(@Body() applyDiscoutDto: ApplyDiscountDto) {
    try {
      const discountResult = await this.discountsService.applyDiscount(applyDiscoutDto);
      return { success: true, data: discountResult };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('saved')
  @AuthorizeRoles(Roles.USER,Roles.ADMIN)
  @UseGuards(AuthenticationGuard, AuthorizeGuard)
  async saveDiscount(@Body() saveDiscountDto: saveDiscountDto, @CurrentUser() currentUser: UserEntity) {
    try {
      const saveDiscount = await this.discountsService.saveDiscount(saveDiscountDto, currentUser)
      return { success: true, data: saveDiscount }
    }
    catch (error) {
      return { success: false, msg: error.message }
    }
  }

  @Delete('user/:id')
  @AuthorizeRoles(Roles.ADMIN,Roles.USER)
  @UseGuards(AuthenticationGuard, AuthorizeGuard)
  async deleteSaveDiscount(@Param('id') id:string , @Body() deleteSaveDiscountDto:DeleteSaveDiscountDto , @CurrentUser() currentUser:UserEntity){
    const res = await this.discountsService.deleteSaveDiscout(+id , deleteSaveDiscountDto, currentUser)
    return res
  }

  @Get('user/:code')
  async userUseDiscount(@Param('code') code: string) {
    const res = await this.discountsService.userUseDiscount(code,)
    return res
  }

  @Get(':userId') 
  async getAll(@Param('userId') userId:string,@Query() filterDiscountDto:filterDiscountDto): Promise<DiscountEntity[]>
  {
    const res = await this.discountsService.getAll(+userId ,filterDiscountDto)
    return res
  }


}
