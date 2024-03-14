import { PartialType } from '@nestjs/mapped-types';
import { CreateGiaohangnhanhDto } from './create-giaohangnhanh.dto';

export class UpdateGiaohangnhanhDto extends PartialType(CreateGiaohangnhanhDto) {}
