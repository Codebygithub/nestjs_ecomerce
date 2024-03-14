import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { NotFoundError } from 'rxjs';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(CategoryEntity) private readonly categoriesService:Repository<CategoryEntity>,
  private readonly userService:UserService
  ){}
  async create(createCategoryDto: CreateCategoryDto,currentUser:UserEntity):Promise<CategoryEntity>{
    console.log(currentUser)
    const category = await this.categoriesService.create(createCategoryDto)
    category.addedBy = currentUser
    return await this.categoriesService.save(category)
  }

  async findAll(): Promise<CategoryEntity[]> {
    return this.categoriesService.find()
  }

  async findOne(id: number): Promise<CategoryEntity> {
    const category = await  this.categoriesService.findOne({
      where:{id},
      relations:{addedBy:true},
      select:{
        addedBy:{
          id:true,
          name:true,
          email:true
        }
      } 
    })
    if(!category) throw new NotFoundException()
    return category
  }

  async update(id: number, fields:Partial<UpdateCategoryDto>,currentUser:UserEntity) {
    const category = await this.findOne(id)
    if(!category) throw new NotFoundException()
  
    category.addedBy = currentUser
    Object.assign(category,fields)
    return await this.categoriesService.save(category)
  }

  async remove(category: CategoryEntity): Promise<CategoryEntity> {
    return this.categoriesService.remove(category);
  }
  
  async isUserOwner(addedBy: number, currentUser: number): Promise<boolean> {
    const user = await this.userService.findOne(currentUser);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    return addedBy === user.id;
  }
}

