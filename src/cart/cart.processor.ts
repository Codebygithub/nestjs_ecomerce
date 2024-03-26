// cart.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-card.dto';


@Processor('cart')
export class CartQueueWorker {
  constructor(private readonly cartService: CartService) {}

  @Process('getCart')
  async handleGetCart(job: Job) {
  const userId = job.data.userId;
  const cartItems = await this.cartService.getCart(userId);
  return cartItems; // Trả về kết quả của công việc

  }
}

  

