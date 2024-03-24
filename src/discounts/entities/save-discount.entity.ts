// saved-discount.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { DiscountEntity } from './discount.entity';
import { UserEntity } from 'src/user/entities/user.entity';

@Entity()
export class SavedDiscountEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, user => user.savedDiscounts)
  user: UserEntity;

  @ManyToOne(() => DiscountEntity, discount => discount.savedDiscounts)
  discount: DiscountEntity;

  @Column()
  saveAt:Date
}
