import { Process, Processor } from "@nestjs/bull";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository, Transaction } from "typeorm";
import { ProductEntity } from "./entities/product.entity";
import { CategoriesService } from "src/categories/categories.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UserEntity } from "src/user/entities/user.entity";
import { Job } from "bull";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";

@Injectable()
@Processor('product')
export class ProductWorker {
    constructor( @InjectEntityManager() private readonly entityManager:EntityManager,
                private readonly categoryService:CategoriesService){}

    private readonly logger = new Logger(ProductWorker.name)
    
    @Process('create-product')
    async createProductJob(job:Job<CreateProductDto>) {
        const {title , description , image , stock , price , categoryId} = job.data
        const category = await this.categoryService.findOne(categoryId)
        if(!category) throw new NotFoundException() 
        let product = new ProductEntity()
        product.title = title 
        product.description  = description 
        product.image = image 
        product.stock = stock 
        product.price= price
        await this.entityManager.save(product)
        this.logger.log(`processing create-product job with data ${job.data}`)
        return product
    }
   
    
}