import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Req, Res, NotFoundException, ForbiddenException, HttpStatus, BadRequestException } from '@nestjs/common';
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

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @AuthorizeRoles(Roles.ADMIN)  
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async create(@Body() createOrderDto: CreateOrderDto,@CurrentUser() CurrentUser:UserEntity):Promise<OrderEntity> {
    return await  this.orderService.create(createOrderDto,CurrentUser);
  }

  @Get()
  @AuthorizeRoles(Roles.ADMIN)  
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async findAll():Promise<OrderEntity[]> {
    return this.orderService.findAll();
  }

  @Get(':id')
  @AuthorizeRoles(Roles.ADMIN)  
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async findOne(@Param('id') id: string):Promise<OrderEntity> {
    return this.orderService.findOne(+id);
  }

  @Patch(':id')
  @AuthorizeRoles(Roles.ADMIN)  
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async update(@Param('id') id: string, @Body() updateOrderStatusDto: updateOrderStatusDto, @Req() req:Request ,@Res() res:Response ): Promise<void> {
    const order = await this.orderService.findOne(+id)
    const currentUser: UserEntity = req.currentUser;
    if(!order) throw new NotFoundException('Order not found ')
    try {
      if (!(await this.orderService.isUserOwner(order.updatedBy.id, currentUser.id))) {
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
  async cancelled(@Param('id') id:string ,@Req() req:Request , @Res() res:Response){
    const order = await this.orderService.findOne(+id)
    if(!order ) throw new NotFoundException('order not found')
    if(order?.status === OrderStatus.CENCELLED ) throw new BadRequestException("This order is already canceled")
    const currentUser:UserEntity = req.currentUser

    try {
      if (!(await this.orderService.isUserOwner(order.updatedBy.id, currentUser.id))) {
        throw new ForbiddenException('You are not the owner of this category');
      }
    
      const result = await this.orderService.cancelled(+id,currentUser)
     
      res.status(HttpStatus.OK).json({
        message: 'Category removed successfully',
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
        message: 'An error occurred while removing the category',
      });
    
  }
      
    }

  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
