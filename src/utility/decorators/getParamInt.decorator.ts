import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { isInt } from 'class-validator';

export const GetIntParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const commentId = request.params.commentId;

    if (!isInt(parseInt(commentId, 10))) {
      throw new BadRequestException('Invalid commentId');
    }

    return parseInt(commentId, 10);
  },
);