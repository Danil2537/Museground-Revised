import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ProfileRequestDto } from '../DTO/profileRequestDto';

interface AuthenticatedRequest extends Request {
  user: ProfileRequestDto;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ProfileRequestDto => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
