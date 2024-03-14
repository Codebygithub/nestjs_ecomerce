// cart.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-card.dto';


@Processor('cart')
export class CartProcessor {
  private readonly logger = new Logger(CartProcessor.name);

  constructor(private readonly cartService: CartService) {}

  @Process('addToCart')
  async handleAddToCart(job: Job<AddToCartDto>): Promise<void> {
    this.logger.debug(`Processing job ${job.id}: Add to cart`);
    const data = job.data;
    await this.cartService.addToCart(data);
  }
}
