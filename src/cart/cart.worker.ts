// cart.worker.ts
import { Process, Processor } from '@nestjs/bull';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { Job } from 'bull';
import { ProductsService } from 'src/products/products.service';
import { UserService } from 'src/user/user.service';
import { AddToCartDto } from './dto/add-to-card.dto';
import { CartEntity } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Processor('cart')
export class CartWorker {
  
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    private readonly productService: ProductsService,
    private readonly userService: UserService,
  ) {}

  private readonly logger = new Logger(CartWorker.name);

  @Process('addToCart')
  async handleAddToCart(job: Job<AddToCartDto>): Promise<CartEntity> {
    const { userId, productId, quantity } = job.data;
    console.log('job' , job.data)
  
    // Use userId, productId, and quantity to construct a CartEntity
    const user = await this.userService.findOne(userId);
    const product = await this.productService.findOne(productId);
  
    if (!user) {
      throw new NotFoundException('USER NOT FOUND');
    }
  
    if (!product) {
      throw new NotFoundException('PRODUCT NOT FOUND');
    }
  
    let cartItem = await this.cartRepository.createQueryBuilder('cat')
    .where('cat.productId = :productId', { productId: product.id })
    .andWhere('cat.userId = :userId', { userId: user.id })
    .getOne();

    if(!cartItem)
    {
      cartItem = new CartEntity()
      cartItem.product = product 
      cartItem.user = user 
      cartItem.quantity = quantity
    }
    else{
      cartItem.quantity+=quantity
      if(cartItem.quantity > product.stock)
      throw new BadRequestException(`Only ${product.stock} items are available in stock`);
    }

  
    this.logger.log(`Processing addToCart job with data: ${job.data}`);
    // Save the cartItem to the database
    return this.cartRepository.save(cartItem);
  }

}
