import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors } from '@nestjs/common';

import { CreateGiaohangnhanhDto } from './dto/create-giaohangnhanh.dto';
import { GiaohangnhanhService } from './giaohangnhanh.service';
import { AuthenticationGuard } from 'src/utility/guard/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guard/authorization.guard';
import { Roles } from 'src/utility/common/user-role.enum';
import { AuthorizeRoles } from 'src/utility/decorators/authorize-role.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { cancelDto } from './dto/cancel-giaohangnhanh.dto';

@Controller('giaohangnhanh')
export class GiaohangnhanhController {
  constructor(private readonly giaohangnhanhService:GiaohangnhanhService ) {}

  @Post('create-order/:id')
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async createOrder(@Body() createGiaohangnhanhDto:CreateGiaohangnhanhDto,@Param('id') id:string): Promise<any> {
    const res = await this.giaohangnhanhService.create(createGiaohangnhanhDto,+id);
    console.log('createGiaohangnhanhDto',createGiaohangnhanhDto)
    console.log('res',res)
    return await res
  }

  @Get('get-province')
  @UseInterceptors(CacheInterceptor)
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async getProvince(){
    const res = await this.giaohangnhanhService.getProvince()
    console.log("res",res)
    return await res
  }
  @Get('get-district')
  @UseInterceptors(CacheInterceptor)
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async getDistrict(){
    const res = await this.giaohangnhanhService.getDistrict()
    console.log("res",res)
    return await res
  }
  
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  @Post('cancelOrder/:id')
  async cancel(@Body() CanncelDto:cancelDto,@Param('id')id:string)
  {
    const res = await this.giaohangnhanhService.cancel(CanncelDto,+id)
    return res
  }

}
