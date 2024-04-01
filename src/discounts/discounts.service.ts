import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscountEntity } from './entities/discount.entity';
import { Like, Not, Repository } from 'typeorm';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { DiscountUserEntity } from './entities/discount-user.entity';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { SavedDiscountEntity } from './entities/save-discount.entity';
import { saveDiscountDto } from './dto/save-discount.dto';
import { DeleteSaveDiscountDto } from './dto/delete-Savediscount.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { filterDiscountDto } from './dto/filter-discount.dto';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(DiscountEntity) 
    private readonly discountRepository:Repository<DiscountEntity>,
    private readonly userService:UserService,
    @InjectRepository(DiscountUserEntity) private readonly discoutUserRepository:Repository<DiscountUserEntity>,
    @InjectRepository(SavedDiscountEntity) private readonly saveDiscountRepository:Repository<SavedDiscountEntity>,
    @InjectQueue('discount') private readonly discountQueue:Queue
  ){}

  async getDiscountByCode(code: string): Promise<DiscountEntity | null> {
    return await this.discountRepository.findOne({ where: { code } });
  }

  async getAll(userId:number,filterDiscountDto:filterDiscountDto): Promise<DiscountEntity[]>  {
    const user = await this.userService.findOne(userId)
    if(!user) throw new NotFoundException('USER NOT FOUND')
    const discount = await this.discountRepository.find({
        where:{updateBy:user}
      }
    ) 
    if(!discount) throw new NotFoundException('DISCOUNT NOT FOUND')
    
    
    return discount

  }

  async deleteSaveDiscout(id:number,deleteSaveDiscountDto:DeleteSaveDiscountDto , currentUser:UserEntity):Promise<void> {
    const discount = await this.getDiscountById(id)
    if(!discount) throw new NotFoundException('NOT FOUND')
    const user = await this.userService.findOne(+deleteSaveDiscountDto.userId)
    if(!user) throw new NotFoundException('NOT FOUND')

    const existingUsage = await this.saveDiscountRepository
    .createQueryBuilder('du')
    .where('du.discountId = :discountId', { discountId: discount.id })
    .andWhere('du.userId = :userId', { userId: user.id })
    .getOne();
    

    if(!existingUsage) throw new NotFoundException('Saved discount not found');
    await this.saveDiscountRepository.remove(existingUsage)
    
   
    
  }

  async deleteDiscount(id: number):Promise<DiscountEntity> {
    const discount = await this.getDiscountById(id);
    if (!discount) throw new NotFoundException('DISCOUNT NOT FOUND');
  
    // Xóa mối quan hệ trong bảng trung gian (nếu có)
    await this.discoutUserRepository.delete({ discount: { id } });
  
    // Xóa discount
    await this.discountRepository.remove(discount);
    return discount
  }

  async updateDiscount(id:number, updateDiscountDto:UpdateDiscountDto,currentUser:UserEntity)
  {
    const discount = await this.getDiscountById(id)
    if(!discount) throw new NotFoundException('DISCOUNT NOT FOUND')
    if(currentUser.id !== discount.updateBy.id ) 
    throw new UnauthorizedException("You don't have permission to perform this action.")
    for (const [key, value] of Object.entries(updateDiscountDto)) {
      switch (key) {
        case 'discountMaxUse':
          discount.maxUses = value;
          break;
        case 'discountEndDate':
          discount.endDate = new Date(value);
          break;
        case 'discountStartDate':
          discount.startDate = new Date(value);
          break;
        case 'discountMinimumAmount':
          discount.minimumAmount = value;
          break;
        case 'discoutValue':
          discount.value = value;
          break;
      }
    }
    if(discount.startDate > discount.endDate) {
      throw new BadRequestException('The start date must be earlier than the end date.')
    }
    if(new Date() > discount.endDate) 
    {
      throw new BadRequestException('Discount is over .')

    }
    discount.updateBy = currentUser

    await this.discountRepository.save(discount)
    return discount
  }

  

  async applyDiscount(applyDiscountDto: ApplyDiscountDto): Promise<DiscountEntity> {
    const res = await this.discountQueue.add('applyDiscount',applyDiscountDto,{
      removeOnComplete:true
    })
    const rs  = await res.finished()
    return rs
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
      relations:{updateBy:true,users:true , product:true}
    })
    if(!discount) throw new NotFoundException('DISCOUNT NOT FOUND')
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
    
  async checkDiscountAvailableForUser(userId: number,discountCode: string,): Promise<boolean> {
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
  async generateRandomCode(length: number): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }
  async createDiscount(discountData:CreateDiscountDto): Promise<DiscountEntity>{
    const res = await this.discountQueue.add('createDiscount',discountData,{
      removeOnComplete:true
    })
    const rs = res.finished()
    return rs
    }
  async saveDiscount(saveDiscountDto:saveDiscountDto,currentUser:UserEntity) {
    const discount = await this.discountRepository.findOne({
      where: { code: saveDiscountDto.code }
    });

    if (!discount) {
      throw new BadRequestException('Discount is not available');
    }

    if (new Date() > discount.endDate) {
      throw new BadRequestException('Discount is not available');
    }

    const user = await this.userService.findOne(+saveDiscountDto.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingUsage = await this.saveDiscountRepository
    .createQueryBuilder('du')
    .where('du.discountId = :discountId', { discountId: discount.id })
    .andWhere('du.userId = :userId', { userId: user.id })
    .getOne();

    if(existingUsage) throw new BadRequestException('Discount already saved for this user');
  
    const saveDiscount = new SavedDiscountEntity()
    saveDiscount.discount = discount 
    saveDiscount.user = user 
    saveDiscount.saveAt = new Date()

    if (discount.usedCount >= discount.maxUses) {
      await this.deleteDiscount(discount.id)
    }
    saveDiscount.user = currentUser

    return await this.saveDiscountRepository.save(saveDiscount)
  }
}


