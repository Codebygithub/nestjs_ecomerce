import { Injectable } from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscountEntity } from './entities/discount.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DiscountsService {
  constructor(@InjectRepository(DiscountEntity) private readonly discountRepository:Repository<DiscountEntity>){}

  async getDiscountByCode(code: string): Promise<DiscountEntity | null> {
    return await this.discountRepository.findOne({ where: { code } });
  }

  async isDiscountValid(code: string): Promise<boolean> {
    const discount = await this.getDiscountByCode(code);
    if (!discount) return false;
    const now = new Date();
    return now >= discount.startDate && now <= discount.endDate;
  }

}
