import { Module } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { ApiKeyController } from './api-key.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyEntity } from './entities/api-key.entity';

@Module({
  imports:[TypeOrmModule.forFeature([ApiKeyEntity])],
  controllers: [ApiKeyController],
  providers: [ApiKeyService],
  exports:[ApiKeyService]
})
export class ApiKeyModule {}
