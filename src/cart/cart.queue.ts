// cart.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { AddToCartDto } from './dto/add-to-card.dto';

@Injectable()
export class CartService {
  constructor(@InjectQueue('cart') private readonly cartQueue: Queue) {}

  async addToCart(addToCartDto: AddToCartDto): Promise<void> {
    await this.cartQueue.add('addToCart', addToCartDto);
  }
}
