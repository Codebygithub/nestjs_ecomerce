// src/products/product.entity.ts

import { CartEntity } from 'src/cart/entities/cart.entity';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { OrderProductsEntity } from 'src/order/entities/order-products.entity';
import { ReviewEntity } from 'src/review/entities/review.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn, Timestamp, CreateDateColumn, OneToMany } from 'typeorm';

@Entity()
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({type:'decimal',precision:10,scale:2,default:0})
  price: number;

  @Column()
  stock:number;

  @Column('simple-array')
  image:string[]
  
  @Column({nullable:true,default:0})
  view:number
  
  @UpdateDateColumn()
  updatedAt:Timestamp;

  @CreateDateColumn()
  createdAt:Timestamp;  

  @ManyToOne(()=>UserEntity,(user)=>user.products)
  addedBy:UserEntity;

  @ManyToOne(()=>CategoryEntity,(cat)=>cat.products)
  category:CategoryEntity;

  @OneToMany(()=>ReviewEntity,(rev)=>rev.products)
  reviews:ReviewEntity[];

  @OneToMany(()=>OrderProductsEntity,(op)=>op.product)
  products:OrderProductsEntity[]

  @OneToMany(() => CartEntity, cart => cart.product)
  cart: CartEntity[];



  

  
}
