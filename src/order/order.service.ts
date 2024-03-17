import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException, forwardRef } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity, } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrderProductsEntity } from './entities/order-products.entity';
import { ShippingEntity } from './entities/shipping.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/products.service';
import { updateOrderStatusDto } from './dto/update-status.dto';
import { OrderStatus } from './enum/order-status.enum';
import { UserService } from 'src/user/user.service';

@Injectable()
export class OrderService {
  constructor(
              @InjectRepository(OrderEntity) private readonly orderRepository:Repository<OrderEntity>,
              @InjectRepository(OrderProductsEntity) private readonly orderProductRepository:Repository<OrderProductsEntity>,
              private readonly userService:UserService,
              @Inject(forwardRef(()=>ProductsService)) private readonly productService:ProductsService
  ){}
  async create(createOrderDto: CreateOrderDto,currentUser:UserEntity):Promise<OrderEntity> {
    const shippingEntity = new ShippingEntity()
    Object.assign(shippingEntity,createOrderDto.shippingAddress)
    const orderEntity = new OrderEntity()
    orderEntity.shippingAddress = shippingEntity
    orderEntity.user = currentUser
    const orderTbI = await this.orderRepository.save(orderEntity)

    let opEntity: {
      order:OrderEntity,
      product:ProductEntity,
      product_quantity:number,
      product_unit_price:number,
    }[]=[]

    for(let i = 0 ;i<createOrderDto.orderedProducts.length ; i++)
    {
      const order = orderTbI 
      const product = await this.productService.findOne(createOrderDto.orderedProducts[i].id)
      const product_quantity = createOrderDto.orderedProducts[i].product_quantity
      const product_unit_price = createOrderDto.orderedProducts[i].product_unit_price
      opEntity.push({order,product,product_quantity,product_unit_price})
    }
    const op = await this.orderRepository.createQueryBuilder().insert().into(OrderProductsEntity).values(opEntity).execute()


    return await this.findOne(orderTbI.id)
  }

  async findAll():Promise<OrderEntity[]> {
    return  await this.orderRepository.find({
      relations:{
        user:true,
        shippingAddress:true,
        products:{product:true}
      }
    })   }

    async isUserOwner(addedBy: number, currentUser: number): Promise<boolean> {
      const user = await this.userService.findOne(currentUser);
      if (!user) {
        throw new NotFoundException('User not found');
      }
    
      return addedBy === user.id;
    }
  async findOne(id: number):Promise<OrderEntity> {
    return  await this.orderRepository.findOne({
      where:{id},
      relations:{
        user:true,
        shippingAddress:true,
        products:{product:true}
      }
    }) 
   
  }

  async cancelled(id:number,currentUser:UserEntity){
    let order = await this.findOne(id)
    if(!order) throw new NotFoundException('ORDER NOT FOUND')

    if(order.status === OrderStatus.CENCELLED) return order
    
    if(currentUser.id !== order.updatedBy.id) {
      throw new UnauthorizedException("You don't have permission to perform this action")
    }

    order.status = OrderStatus.CENCELLED
    order.updatedBy = currentUser


    order = await this.orderRepository.save(order)
    await this.stockUpdate(order,OrderStatus.CENCELLED)
    return order



  }

  async update(id: number, updateOrderStatusDto: updateOrderStatusDto,currentUser:UserEntity): Promise<OrderEntity> {
   let order =await  this.findOne(id)
   if(!order) throw new NotFoundException('Order not found')
   
   if((order.status === OrderStatus.DELIVERED)|| (order.status === OrderStatus.CENCELLED)){
      throw new BadRequestException('Order already '+order.status)
   }
   if((order.status ===OrderStatus.PROCESSING) && (updateOrderStatusDto.status != OrderStatus.SHIPPED)){
    throw new BadRequestException('Delivered before Shipped')
   }
   if((updateOrderStatusDto.status === OrderStatus.SHIPPED)&& (order.status === OrderStatus.SHIPPED)){
    return order
   }
   if(updateOrderStatusDto.status === OrderStatus.SHIPPED)
   {
    order.shippedAt = new Date()
   }
   if(updateOrderStatusDto.status === OrderStatus.DELIVERED)
   {
    order.deliveredAt = new Date()   
   }
   order.status = updateOrderStatusDto.status
   order.updatedBy = currentUser
   order = await this.orderRepository.save(order)
   if(updateOrderStatusDto.status === OrderStatus.DELIVERED)
   {
    await this.stockUpdate(order,OrderStatus.DELIVERED)
   }
   return order;

  }
  async stockUpdate(order:OrderEntity,status:string)
  {
    for(const op of order.products){
      await this.productService.updateStock(op.product.id,op.product_quantity,status)
    }
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  async findOneByProduct(id:number)
  {
    return await this.orderProductRepository.findOne({
      relations:{product:true},
      where:{product:{id}}
    })
  }
}