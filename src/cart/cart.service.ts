import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { ProductsService } from 'src/products/products.service';
import { UserService } from 'src/user/user.service';
import { AddToCartDto } from './dto/add-to-card.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectQueue } from '@nestjs/bull';


@Injectable()
export class CartService {
 constructor(@InjectRepository(CartEntity) private readonly cartRepository:Repository<CartEntity>,
                                           private readonly productService:ProductsService,
                                           private readonly userService:UserService,
 ){}

  async addToCart(addToCartDto:AddToCartDto): Promise<CartEntity>{
  const {userId , productId , quantity} = addToCartDto

  const user = await this.userService.findOne(userId)
  if(!user) throw new NotFoundException('USER NOT FOUND')

  const product = await this.productService.findOne(productId)

  if(!product) throw new NotFoundException('PRODUCT NOT FOUND')

  let cartItem = await this.cartRepository.createQueryBuilder('cat')
  .where('cat.productId = :productId', { productId: product.id })
  .andWhere('cat.userId = :userId', { userId: user.id })
  .getOne();

  if(!cartItem) {
    cartItem = new CartEntity()
    cartItem.product = product
    cartItem.user = user
    cartItem.quantity = quantity

  }
  else{
    cartItem.quantity +=quantity
    if(cartItem.quantity > product.stock) {
      throw new BadRequestException(`Only ${product.stock} items are available in stock`)
    }
  } 
  return this.cartRepository.save(cartItem)
 }

 async getCart(userId: number): Promise<CartEntity[]> {
  const cartItem = await this.cartRepository
  .createQueryBuilder('cart')
  .leftJoinAndSelect('cart.product','product')
  .where('cart.user =:userId',{userId})
  .getMany()
  if(!cartItem || cartItem.length === 0 ){
    throw new NotFoundException("CART IS EMPTY")
  }
  return cartItem
}

  async checkCartQuantity(cartItems:CartEntity[]):Promise<void>{
  for(const cartItem of cartItems){
    const product = await this.productService.findOne(cartItem.product.id)
    if(!product)  throw new NotFoundException(`Product with id ${cartItem.product.id} not found`);
    if(cartItem.quantity > product.stock)
    {
      throw new BadRequestException(`Quantity of product ${product.title} exceeds available stock`);
    }
    else if(cartItem.quantity == 0 || cartItem.quantity < 0 )
    {
      await this.deleteCartInItem(cartItem.id,cartItem.user)
      throw new BadRequestException("Invalid quantity")
      
    }
  }
  }

  async deleteCartInItem(id:number,currentUser:UserEntity): Promise<CartEntity>
  {
    const cart = await this.cartRepository.findOne({
      where:{id}
    })
    if(!cart) throw new NotFoundException('ITEM IN CART NOT FOUND')
    cart.user = currentUser

    if(currentUser.id !== cart.user.id)
    {
      throw new BadRequestException('YOU ARE NOT OWNER THIS CART ITEM')
    }
    return this.cartRepository.remove(cart)
  }

  async updateCart(cartId:number,updateCartDto:UpdateCartDto,currentUser:UserEntity): Promise<CartEntity>{
    const {quantity , productId} = updateCartDto

    const cart = await this.cartRepository.findOne({
      where:{id:cartId},
      relations:{user:true}
    })
    if(!cart) throw new NotFoundException('CART NOT FOUND')

    const product = await this.productService.findOne(productId)

    if(!product) throw new NotFoundException('PRODUCT NOT FOUND ')

    if(currentUser.id !== cart.user.id) {
      throw new UnauthorizedException('You are not owner of this Cart')
    }
    cart.quantity = quantity
    if(cart.quantity > product.stock) {
      throw new BadRequestException('Requested quantity exceeds available stock')
    }

    cart.user = currentUser

    if(quantity == 0 || quantity < 0 ) {
      await this.deleteCartInItem(cart.id,cart.user)

    }
    await this.cartRepository.save(cart)
    return cart;
    
  }
}


