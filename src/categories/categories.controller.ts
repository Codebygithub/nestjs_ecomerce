import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Put, Res, Req, NotFoundException, ForbiddenException, HttpStatus } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthenticationGuard } from 'src/utility/guard/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guard/authorization.guard';
import { AuthorizeRoles } from 'src/utility/decorators/authorize-role.decorator';
import { Roles } from 'src/utility/common/user-role.enum';
import { CurrentUser } from 'src/utility/decorators/currentUser.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { CategoryEntity } from './entities/category.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Request, Response } from 'express';


@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('create-categories')
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async create(@Body() createCategoryDto: CreateCategoryDto , @CurrentUser() CurrentUser:UserEntity):Promise<CategoryEntity> {
  // console.log(CurrentUser)
    return await  this.categoriesService.create(createCategoryDto,CurrentUser);
  }

  @Get('all')
  @UseInterceptors(CacheInterceptor)
  async findAll(): Promise<CategoryEntity[]> {
    return  this.categoriesService.findAll();
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id') id: string): Promise<CategoryEntity> {
    return this.categoriesService.findOne(+id);
  }

  @Patch(':id')
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  @UseInterceptors(CacheInterceptor)
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto,@Res() res:Response , @Req() req:Request) {
    const currentUser: UserEntity = req.currentUser;
    const category = await this.categoriesService.findOne(+id)
    if(!category) 
    throw new NotFoundException('Category not found');
    try {
      if (!(await this.categoriesService.isUserOwner(category.addedBy.id, currentUser.id))) {
        throw new ForbiddenException('You are not the owner of this category');
        }
        const result = await this.categoriesService.update(category.id,updateCategoryDto,currentUser);
        res.status(HttpStatus.OK).json({
          message: 'Category updated successfully',
          result,
        })
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof ForbiddenException) {
        res.status(HttpStatus.FORBIDDEN).json({
          message: error.message,
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'An error occurred while update the category',
        });
      
    }
    }
   
  }

  @Put(':id')
  @AuthorizeRoles(Roles.ADMIN)
  @UseGuards(AuthenticationGuard,AuthorizeGuard)
  async remove(@Param('id') id: number, @Res() res: Response, @Req() req: Request) {
  const currentUser: UserEntity = req.currentUser;
  const category = await this.categoriesService.findOne(+id);
  if (!category) {
    throw new NotFoundException('Category not found');
  }
  try {
    if (!(await this.categoriesService.isUserOwner(category.addedBy.id, currentUser.id))) {
      throw new ForbiddenException('You are not the owner of this category');
    }
  
    const result = await this.categoriesService.remove(category);
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
}
