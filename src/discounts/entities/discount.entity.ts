// discount.entity.ts
import { DiscountType } from 'src/order/enum/discount-type.enum';
import { ProductEntity } from 'src/products/entities/product.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { DiscountUserEntity } from './discount-user.entity';

@Entity()
export class DiscountEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  value: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startDate: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  endDate: Date;

  @Column({ default: 0 })
  maxUses: number;

  @Column({ default: 0 })
  usedCount: number;

  @Column({ nullable: true,default:DiscountType.PERCENTAGE })
  type: DiscountType; 

  @Column({ nullable: true })
  minimumAmount: number;

  @Column({ nullable: true })
  description: string;

  @Column({default:false})
  use:boolean

  @ManyToOne(() => UserEntity, user => user.discounts)
  updateBy: UserEntity;

  @ManyToOne(() => ProductEntity, product => product.discounts)
  product: ProductEntity;

  @OneToMany(() => DiscountUserEntity, discountUser => discountUser.discount)
  users: DiscountUserEntity[];

}
