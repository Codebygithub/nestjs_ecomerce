import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscountEntity } from './entities/discount.entity';
import { Repository } from 'typeorm';
import { CreateDiscountDto } from './dto/create-discount.dto';

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


  async getDiscountById(id:number): Promise<DiscountEntity>{
    const discount =  await this.discountRepository.findOne({
      where:{id},
      relations:{updateBy:true}
    })
    return discount


  }

  async CountDiscount(code: string): Promise<void> {
    const discount = await this.discountRepository.findOne({
      where: { code },
    });

    if (!discount) {
      throw new Error('Discount not found');
    }

    discount.usedCount++;
    await this.discountRepository.save(discount);
  }

  async userUseDiscount(code:string){
    const discount = await this.discountRepository.findOne({
      where:{code},
      relations:{
        product:true,
        updateBy:true
      }
      
    })
    if(!discount)
    throw new HttpException("This Discount is not available",HttpStatus.NOT_FOUND)
    discount.use = true
    return await this.discountRepository.save(discount)
  }
    
  async checkDiscountAvailableForUser(
    userId: number,
    discountCode: string,
  ): Promise<boolean> {
    const discount = await this.discountRepository.findOne({
      where: { code: discountCode },
      relations: {product:true}, 
    });

    if (!discount) {
      return false;
    }

    //dem so lan user su dung discount
    const userUsedCount = await this.discountRepository.createQueryBuilder('discount')
    .leftJoinAndSelect('discount.updatedBy','user')
    .where('discount.code=:code',{code:discountCode})
    .andWhere('user.id=:userId',{userId})
    .getCount()


    //So sánh số lần sử dụng với số lượng tối đa cho phép
    return userUsedCount < discount.maxUses; 
  }



  async deleteDiscount(id: number): Promise<void> {
    await this.discountRepository.delete(id);
  }

  async createDiscount(discountData:CreateDiscountDto): Promise<DiscountEntity>{
    const discount =  this.discountRepository.create(discountData)
    return discount
  }



 

  }


