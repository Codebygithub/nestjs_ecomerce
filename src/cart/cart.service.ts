import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { ProductsService } from 'src/products/products.service';
import { UserService } from 'src/user/user.service';
import { AddToCartDto } from './dto/add-to-card.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cache } from 'cache-manager';


@Injectable()
export class CartService {
 constructor(@InjectRepository(CartEntity) private readonly cartRepository:Repository<CartEntity>,
                                           private readonly productService:ProductsService,
                                           private readonly userService:UserService,
            @InjectQueue('cart')           private readonly cartQueue:Queue,
            @Inject('CACHE_MANAGER') private readonly cacheManager:Cache
 ){}

 async addToCart(addToCartDto: AddToCartDto) {
 const res= await  this.cartQueue.add('addToCart', addToCartDto,{
  removeOnComplete:true
 });
 console.log('res service' , res)
 return res
  


}

 async getCart(userId: number): Promise<{
  cartItem: CartEntity[];
  totalQuantity:number,
  totalPrice:number
}> {  
  const cacheKey =`cart:${userId}`
  const cachedCart = await this.cacheManager.get(cacheKey)
  if(cachedCart) {
    return cachedCart as {cartItem:CartEntity[] , totalQuantity:number,totalPrice:number}
  }
  const cartItem = await this.cartRepository
  .createQueryBuilder('cart')
  .leftJoinAndSelect('cart.product','product')
  .where('cart.user =:userId',{userId})
  .getMany()
  if(!cartItem || cartItem.length === 0 ){
    throw new NotFoundException("CART IS EMPTY")
  }
  const totalQuantity =this.getTotalQuantity(cartItem)
  const totalPrice=  this.getCartTotal(cartItem)
  await this.cacheManager.set(cacheKey,{cartItem,totalPrice,totalQuantity})
  return {cartItem ,totalQuantity , totalPrice }
}

private getCartTotal(cartItems:CartEntity[]){
  let totalPrice = 0 
  cartItems?.forEach((item)=>{
    totalPrice += item.quantity * item.product.price
  });
  return totalPrice;

}
  private getTotalQuantity(cartItems: CartEntity[]): number {
    let totalQuantity = 0;
    cartItems.forEach(item => {
    totalQuantity += item.quantity;
  });
  return totalQuantity;
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
    if(!currentUser) throw new NotFoundException('Current User is missing')
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


