import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryEntity } from './entities/inventory.entity';

@Module({
  imports:[TypeOrmModule.forFeature([InventoryEntity])],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports:[TypeOrmModule]
})
export class InventoryModule {}
