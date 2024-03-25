import { CartEntity } from "src/cart/entities/cart.entity";
import { CategoryEntity } from "src/categories/entities/category.entity";
import { ChatEntity } from "src/chat/entities/chat.entity";
import { DiscountUserEntity } from "src/discounts/entities/discount-user.entity";
import { DiscountEntity } from "src/discounts/entities/discount.entity";
import { SavedDiscountEntity } from "src/discounts/entities/save-discount.entity";
import { FavoriteEntity } from "src/favorite/entities/favorite.entity";
import { OrderEntity } from "src/order/entities/order.entity";
import { ProductEntity } from "src/products/entities/product.entity";
import { ReviewEntity } from "src/review/entities/review.entity";
import { Roles } from "src/utility/common/user-role.enum";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    name:string;
    @Column({unique:true})
    email:string;
    @Column({select:false})
    password:string;
    @Column({type:'enum',enum:Roles,array:true,default:[Roles.USER]})
    roles:Roles[]
    @Column({nullable:true})
    resetToken:string;
    @Column({nullable:false,default:''})
    otpHash:string
    @Column({ nullable: true, default: null })
    avatar: string;

    @Column({nullable:false , default:false})
    isActive: boolean ;

    @Column({nullable:true,default:''})
    introduction:string

    @CreateDateColumn()
    createdAt:Timestamp;
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @OneToMany(()=>CategoryEntity , (cat)=>cat.addedBy)
    categories:CategoryEntity[]

    @OneToMany(()=>ProductEntity,(prod)=>prod.addedBy)
    products:ProductEntity[]

    @OneToMany(()=>ReviewEntity , (rev)=>rev.user)
    reviews:ReviewEntity[]

    @OneToMany(()=>OrderEntity , (order)=>order.updatedBy)
    ordersUpdateBy:OrderEntity[]

    @OneToMany(()=>OrderEntity,(order)=>order.user)
    orders:OrderEntity[];

    @OneToMany(() => ChatEntity, chat => chat.user)
    chats: ChatEntity[];

    @OneToMany(() => CartEntity, cart => cart.user)
    cart: CartEntity[];

    @OneToMany(() => DiscountEntity, discount => discount.updateBy)
    discounts: DiscountEntity[];

    
    @OneToMany(() => DiscountUserEntity, discountUser => discountUser.user)
    discountsUser: DiscountUserEntity[];

    @OneToMany(()=>SavedDiscountEntity , savediscount =>savediscount.user)
    savedDiscounts : SavedDiscountEntity []

    @OneToMany(()=> FavoriteEntity , (fav)=>fav.user)
    favorites:FavoriteEntity[]
    

}

   

