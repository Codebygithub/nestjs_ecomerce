// update-chat.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateChatDto {
  @IsNotEmpty()
  readonly id: number;

  @IsString()
  readonly message: string;

  // Add other fields as needed
}
