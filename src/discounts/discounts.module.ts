import { Module } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { DiscountsController } from './discounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountEntity } from './entities/discount.entity';

@Module({
  imports:[TypeOrmModule.forFeature([DiscountEntity])],
  controllers: [DiscountsController],
  providers: [DiscountsService],
})
export class DiscountsModule {}
