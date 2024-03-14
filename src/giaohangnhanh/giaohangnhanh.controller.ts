import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors } from '@nestjs/common';

import { CreateGiaohangnhanhDto } from './dto/create-giaohangnhanh.dto';
import { GiaohangnhanhService } from './giaohangnhanh.service';
import { AuthenticationGuard } from 'src/utility/guard/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guard/authorization.guard';
import { Roles } from 'src/utility/common/user-role.enum';
import { AuthorizeRoles } from 'src/utility/decorators/authorize-role.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('giaohangnhanh')
export class GiaohangnhanhController {
  constructor(private readonly giaohangnhanhService:GiaohangnhanhService ) {}

  @Post('create-order')
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async createOrder(@Body() createGiaohangnhanhDto:CreateGiaohangnhanhDto): Promise<any> {
    const res = await this.giaohangnhanhService.create(createGiaohangnhanhDto);
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

}
