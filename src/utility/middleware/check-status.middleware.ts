// check-order-status.middleware.ts
import { Injectable, NestMiddleware,  } from '@nestjs/common';
import { Request, Response } from 'express';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class CheckOrderStatusMiddleware implements NestMiddleware {
  constructor(private readonly orderService: OrderService) {}

  async use(req: Request, res: Response, next: Function) {
    const orderId = req.body.orderId; // Đảm bảo rằng bạn đã gửi orderId từ client
    const order = await this.orderService.findOne(orderId);

    if (!order || order.status !== 'received') {
      res.status(400).json({ message: 'You cannot review the product until you have received it' });
    } else {
      next();
    }
  }
}
