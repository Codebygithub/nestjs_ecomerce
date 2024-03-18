import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Query, Req, NotFoundException, Res, ForbiddenException, HttpStatus, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { AuthorizeRoles } from 'src/utility/decorators/authorize-role.decorator';
import { AuthenticationGuard } from 'src/utility/guard/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guard/authorization.guard';
import { Roles } from 'src/utility/common/user-role.enum';
import { CurrentUser } from 'src/utility/decorators/currentUser.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { FilterProductDto } from './dto/filter-product.dto';
import { Request, Response } from 'express';
import { SerializeIncludes } from 'src/utility/interceptors/serialize.interceptors';
import { productDto } from './dto/product.dto';
import { Throttle } from '@nestjs/throttler';
import { RateLimitService } from 'src/utility/service/rate-limit.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService,
              private readonly ratelimitService:RateLimitService
    ) {}

  @Post('create-product')
  @Throttle({default:{ttl:10000,limit:5}})
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async create(@Body() createProductDto: CreateProductDto,@CurrentUser() currentUser:UserEntity):Promise<ProductEntity> {
    return await this.productsService.create(createProductDto,currentUser)
  }

  @Get()
  @SerializeIncludes(productDto)
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  @Throttle({default:{ttl:10000,limit:5}})
  @UseInterceptors(CacheInterceptor)
  async findAll(@Query() query:any,@Req() req):Promise<productDto> {
    const ipAddress = req.ip
    const limit = +process.env.LIMIT
    const ttl = +process.env.TTL
    const underLimit = await this.ratelimitService.incrementAndCheckLimit(ipAddress,limit,ttl)
    if(!underLimit) {
      throw new BadRequestException('OVER REQUEST')
    }
    const res = await this.productsService.findAll(query);
    return res
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @AuthorizeRoles(Roles.ADMIN)  
  @Throttle({default:{ttl:10000,limit:5}})
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async findOne(@Param('id') id: string):Promise<ProductEntity> {
    return await this.productsService.findOne(+id);
  }

  @Patch(':id')
  @Throttle({default:{ttl:10000,limit:5}})
  @AuthorizeRoles(Roles.ADMIN)  
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto , @Req() req:Request,@Res() res:Response):Promise<void> {
    const currentUser:UserEntity = req.currentUser
    const product = await this.productsService.findOne(+id)
    if(!product) throw new NotFoundException()
    try {
      if(!(await this.productsService.isOwnerUserProduct(product.addedBy.id,currentUser.id))){
        throw new ForbiddenException('You are not the owner of this product');

      }
      const result = await this.productsService.update(product.id , updateProductDto,currentUser)
      res.status(HttpStatus.OK).json({
        msg:"updated product successfully",
        result
      })
    } catch (error) {
      if(error instanceof ForbiddenException){
        res.status(HttpStatus.FORBIDDEN).json({
          msg:error.message
        })
      }
      else{
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'An error occurred while update the product',
        
        })
      }
      }
      
    }
  
  @Post(':id/view')
  @Throttle({default:{ttl:10000,limit:5}})
  @AuthorizeRoles(Roles.ADMIN)  
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  @UseInterceptors(CacheInterceptor)
  async increaseViewCount(@Param('id') productId: number,@CurrentUser() currentUser:UserEntity): Promise<ProductEntity> {
    const res = await this.productsService.increaseViewCount(productId,currentUser);
    return res
  }

  @Delete(':id')
  remove(@Param('id') id: string , @CurrentUser() currentUser:UserEntity) {
    return this.productsService.remove(+id,currentUser);
  }
  @Get('getRecommendedProduct/:productId')
  @Throttle({default:{ttl:10000,limit:5}})
  @UseInterceptors(CacheInterceptor)
  async getRecommendedProduct(@Param('productId',ParseIntPipe) productId:number): Promise<ProductEntity[]>{
    const res = await this.productsService.getRecommededProduct(productId)
    return res
  }
}
