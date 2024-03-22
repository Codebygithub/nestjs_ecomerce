import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscountEntity } from './entities/discount.entity';
import { Repository } from 'typeorm';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { DiscountUserEntity } from './entities/discount-user.entity';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(DiscountEntity) 
    private readonly discountRepository:Repository<DiscountEntity>,
    private readonly userService:UserService,
    @InjectRepository(DiscountUserEntity) private readonly discoutUserRepository:Repository<DiscountUserEntity>
  ){}

  async getDiscountByCode(code: string): Promise<DiscountEntity | null> {
    return await this.discountRepository.findOne({ where: { code } });
  }

  async applyDiscount(applyDiscountDto: ApplyDiscountDto): Promise<DiscountEntity> {
    const discount = await this.discountRepository.findOne({
      where: { code: applyDiscountDto.code }
    });

    if (!discount) {
      throw new BadRequestException('Discount is not available');
    }

    if (discount.use == true || new Date() > discount.endDate) {
      throw new BadRequestException('Discount is not available');
    }

    const user = await this.userService.findOne(+applyDiscountDto.userId);

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
        discount.use = true;
      }
  
      await this.discountRepository.save(discount);

      
    }
    
    

    return discount;
    
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

  async CountDiscount(code: string): Promise<DiscountEntity> {
    const discount = await this.discountRepository.findOne({
      where: { code },
    });

    if (!discount) {
      throw new Error('Discount not found');
    }

    discount.usedCount++;
    await this.discountRepository.save(discount);
    return discount
  }

  async userUseDiscount(code:string){
    // const user = await this.userService.findOne(userId)
    // if(!user) 
    
    // throw new HttpException("This User is not available",HttpStatus.NOT_FOUND)
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
      relations: {
        product:true,
        updateBy:true
      }, 
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

  async generateRandomCode(length: number): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }
  async createDiscount(discountData:CreateDiscountDto,currentUser:UserEntity): Promise<DiscountEntity>{
    const code = await this.generateRandomCode(5)
    const discount =  this.discountRepository.create({code,...discountData})
    discount.updateBy = currentUser
    await this.discountRepository.save(discount)
    return discount
  }



 

  }


