import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Req, Res, NotFoundException, ForbiddenException, HttpStatus, BadRequestException, UseInterceptors } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CurrentUser } from 'src/utility/decorators/currentUser.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { AuthenticationGuard } from 'src/utility/guard/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guard/authorization.guard';
import { AuthorizeRoles } from 'src/utility/decorators/authorize-role.decorator';
import { Roles } from 'src/utility/common/user-role.enum';
import { OrderEntity } from './entities/order.entity';
import { updateOrderStatusDto } from './dto/update-status.dto';
import { Response , Request } from 'express';
import { OrderStatus } from './enum/order-status.enum';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AuthenticationGuard)
  @Post()
  async create(@Body() createOrderDto:CreateOrderDto,@CurrentUser() currentUser:UserEntity)
  {
     return  await this.orderService.create(createOrderDto,currentUser)
  
  }
 

  @Get()
  @UseInterceptors(CacheInterceptor)
  @AuthorizeRoles(Roles.ADMIN)  
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async findAll():Promise<OrderEntity[]> {
    return this.orderService.findAll();
  }

  @Get(':id')
  @AuthorizeRoles(Roles.ADMIN)  
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async findOne(@Param('id') id: string):Promise<OrderEntity> {
    return await this.orderService.findOne(+id);
  }

  @Patch(':id')
  @AuthorizeRoles(Roles.ADMIN)  
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async update(@Param('id') id: string, @Body() updateOrderStatusDto: updateOrderStatusDto, @Req() req:Request ,@Res() res:Response ): Promise<void> {
    const order = await this.orderService.findOne(+id)
    const currentUser: UserEntity = req.currentUser;
    if(!order) throw new NotFoundException('Order not found ')
    try {
      if (!(await this.orderService.isUserOwner(order.user.id, currentUser.id))) {
        throw new ForbiddenException('You are not the owner of this order');
        }
        const result = await this.orderService.update(order.id,updateOrderStatusDto,currentUser);
        res.status(HttpStatus.OK).json({
          message: 'order updated successfully',
          result,
        })
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof ForbiddenException) {
        res.status(HttpStatus.FORBIDDEN).json({
          message: error.message,
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'An error occurred while update the order',
        });
      
    }
    }
  
  }

  @Put('cancel/:id')
  @AuthorizeRoles(Roles.ADMIN)  
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async cancelled(@Param('id') id:string ,@CurrentUser() currentUser:UserEntity){
    const res = await this.orderService.cancelled(+id,currentUser)
    return res
    

  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
