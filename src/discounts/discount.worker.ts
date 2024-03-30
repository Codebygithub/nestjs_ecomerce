import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscountUserEntity } from './entities/discount-user.entity';
import { SavedDiscountEntity } from './entities/save-discount.entity';
import { DiscountEntity } from './entities/discount.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { Job } from 'bull';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
@Processor('discount')
export class discountWorker {
    constructor(   
    @InjectRepository(DiscountEntity) 
    private readonly discountRepository:Repository<DiscountEntity>,
    private readonly userService:UserService,
    @InjectRepository(DiscountUserEntity) private readonly discoutUserRepository:Repository<DiscountUserEntity>,
    @InjectRepository(SavedDiscountEntity) private readonly saveDiscountRepository:Repository<SavedDiscountEntity>
  ){}
  private readonly logger = new Logger(discountWorker.name);
        
@Process('applyDiscount') 
async applyDiscount(job:Job<ApplyDiscountDto>): Promise<DiscountEntity> {
    const {code , userId} = job.data
    const discount = await this.discountRepository.findOne({
        where:{code}
    })
    

    if (!discount) {
      throw new BadRequestException('Discount is not available');
    }

    if (discount.use == true || new Date() > discount.endDate) {
      throw new BadRequestException('Discount is not available');
    }

    const user = await this.userService.findOne(+userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingUsage = await this.discoutUserRepository
    .createQueryBuilder('du')
    .where('du.discountId = :discountId', { discountId: discount.id })
    .andWhere('du.userId = :userId', { userId: user.id })
    .getOne();
  
  console.log('existingUsage', existingUsage);
  

    if (existingUsage ) {
      throw new BadRequestException('NOOOO')
    }
    else{
      const discountUser = new DiscountUserEntity();
      discountUser.discount = discount;
      discountUser.user = user;
      discountUser.usedAt = new Date();
      discountUser.used = true;
      await this.discoutUserRepository.save(discountUser);
      discount.usedCount++;
      if (discount.usedCount >= discount.maxUses) {
        throw new NotFoundException('OVER QUANTITY')
      }
      await this.discountRepository.save(discount);
    }

    this.logger.log(`Processing ApplyDiscount job with data: ${job.data}`)
    
    return discount;
    
  }
}
