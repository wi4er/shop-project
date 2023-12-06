import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export const CurrentUser = (...args: string[]) => {
  SetMetadata('current-user', args);
}

export const CurrentGroups = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest()
    const user = req?.session?.user;

    if (user) return user.group;
    else return [];
  },
)