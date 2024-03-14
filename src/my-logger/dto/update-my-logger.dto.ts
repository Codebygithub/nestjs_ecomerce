import { PartialType } from '@nestjs/mapped-types';
import { CreateMyLoggerDto } from './create-my-logger.dto';

export class UpdateMyLoggerDto extends PartialType(CreateMyLoggerDto) {}
