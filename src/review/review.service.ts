import { Injectable, NotFoundException, flatten } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/review.entity';
import { Connection, Repository } from 'typeorm';
import { ProductsService } from 'src/products/products.service';
import { UserService } from 'src/user/user.service';


@Injectable()
export class ReviewService {
  constructor(@InjectRepository(ReviewEntity) private readonly reviewRepository:Repository<ReviewEntity>,
  private readonly productService:ProductsService,
  private readonly userService:UserService,
  private readonly connection:Connection
){}
  async create(createReviewDto: CreateReviewDto,CurrentUser:UserEntity): Promise<ReviewEntity> {
    let product = await this.productService.findOne(createReviewDto.productId)
    let review = await this.findUserAndProduct(CurrentUser.id,createReviewDto.productId)
    if(!review)
      {
        // return this.reviewRepository.save({...createReviewDto,userId: CurrentUser.id ,product})
        review = await this.reviewRepository.create(createReviewDto)
        review.user = CurrentUser
        review.products = product
      }
    else{
      review.comment = createReviewDto.comment
      review.ratings = createReviewDto.ratings

    }
    return await this.reviewRepository.save(review)
  }

  async findUserAndProduct(userId:number,productId:number){
    return await this.reviewRepository.findOne({
      where:{
        user:{
          id:userId
        },
        products:{
          id:productId
        }
        
      },
      relations:{
        user:true,
        products:{
          category:true
        }
      }
    })
  }

  findAll() {
    return `This action returns all review`;
  }

  async findAllByProduct(id:number):Promise<ReviewEntity[]>{
    const product = await this.productService.findOne(id)
    return await this.reviewRepository.find({
      where:{products:{id}},
      relations:{
        user:true,
        products:{
          category:true
        }
      }
    })
    
    
  }

  async findOne(id: number): Promise<ReviewEntity> {
    const review  = await this.reviewRepository.findOne({
      where:{id},
      relations:{
        user:true,
        products:{
          category:true
        }
      },
      select:{
        user:{
          id:true,
          name:true
        },
        products:{
          id:true,
          title:true,
          description:true,
        }
      }
    })
    if(!review) throw new NotFoundException()
    return review
  }

  async update(id: number, fields:Partial<UpdateReviewDto>,currentUser:UserEntity) {
    const product = await this.productService.findOne(id)
    if(!product) throw new NotFoundException('Product not found ')
    let review = await this.findOne(id);
    if(review){
      review.comment = fields.comment 
      review.ratings = fields.ratings
      review.user = currentUser;
      review.products = product
    }
    return await this.reviewRepository.save(review) 
  }
  async isOwnerUserReview(addedBy:number,currentUser:number):Promise<boolean>{
    const user = await this.userService.findOne(currentUser)
    if(!user) throw new NotFoundException()
    return addedBy === user.id

  }

  async remove(review:ReviewEntity): Promise<ReviewEntity> {
    const reviewExisting = await this.findOne(review.id)
    if(!reviewExisting) throw new NotFoundException('REVIEW NOT FOUND')
    const queryRunner = this.connection.createQueryRunner() ;
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      await queryRunner.manager.remove(review)
      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction() 
      throw error
    }
    finally{
      await queryRunner.release()
    }
    return review
  }
}
