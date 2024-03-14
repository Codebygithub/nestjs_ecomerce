import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UseGuards, NotFoundException, Req, Res, ForbiddenException, HttpStatus, Put } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CurrentUser } from 'src/utility/decorators/currentUser.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { ReviewEntity } from './entities/review.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { AuthenticationGuard } from 'src/utility/guard/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guard/authorization.guard';
import { AuthorizeRoles } from 'src/utility/decorators/authorize-role.decorator';
import { Roles } from 'src/utility/common/user-role.enum';
import { Request, Response } from 'express';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('create-review')
  @AuthorizeRoles(Roles.ADMIN)  
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async create(@Body() createReviewDto: CreateReviewDto,@CurrentUser()CurrentUser:UserEntity): Promise<ReviewEntity> {
    return this.reviewService.create(createReviewDto,CurrentUser);
  }

  @Get('all')
  @UseInterceptors(CacheInterceptor)
  findAll() {
    return this.reviewService.findAll();
  }
  
  @Get()
  @UseInterceptors(CacheInterceptor)
  async findAllByProduct(@Body('productId') productId:number):Promise<ReviewEntity[]>{
    return await this.reviewService.findAllByProduct(+productId)
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  async findOne(@Param('id') id: string): Promise<ReviewEntity> {
    return this.reviewService.findOne(+id);
  }

  @Put(':id')
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async remove(@Param('id') id: number, @Res() res: Response, @Req() req: Request) {
  const currentUser: UserEntity = req.currentUser;
  const review = await this.reviewService.findOne(+id);
  if (!review) {
    throw new NotFoundException('Category not found');
  }
  try {
    if (!(await this.reviewService.isOwnerUserReview(review.user.id, currentUser.id))) {
      throw new ForbiddenException('You are not the owner of this category');
    }
  
    const result = await this.reviewService.remove(review);
    res.status(HttpStatus.OK).json({
      message: 'Category removed successfully',
      result,
    })
  } catch (error) 
  {
    console.error('Error:', error);
    if (error instanceof ForbiddenException) {
      res.status(HttpStatus.FORBIDDEN).json({
        message: error.message,
      });
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'An error occurred while removing the category',
      });
    
  }
 
}
}

    @Patch(':id')
    @AuthorizeRoles(Roles.ADMIN)  
    @UseGuards(AuthenticationGuard,AuthorizeGuard)
    async update(@Param('id') id: string, @Body() UpdateReviewDto:UpdateReviewDto , @Req() req:Request,@Res() res:Response):Promise<void> {
      const currentUser:UserEntity = req.currentUser
      const review = await this.reviewService.findOne(+id)
      if(!review) throw new NotFoundException()
      try {
        if(!(await this.reviewService.isOwnerUserReview(review.user.id,currentUser.id))){
          throw new ForbiddenException('You are not the owner of this product');
  
        }
        const result = await this.reviewService.update(review.id , UpdateReviewDto,currentUser)
        res.status(HttpStatus.OK).json({
          msg:"updated review successfully",
          result
        })
      } catch (error) {
        if(error instanceof ForbiddenException){
          res.status(HttpStatus.FORBIDDEN).json({
            msg:error.message
          })
        }
        else{
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'An error occurred while update the review',
          
          })
        }
        }
        
      }
}
