// discount-user.entity.ts
import { DiscountEntity } from 'src/discounts/entities/discount.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class DiscountUserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DiscountEntity, discount => discount.users)
  discount: DiscountEntity;

  @ManyToOne(() => UserEntity, user => user.discountsUser)
  user: UserEntity;
  
  @Column({default:false})
  used:boolean

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  usedAt: Date;

  

  
   
}
