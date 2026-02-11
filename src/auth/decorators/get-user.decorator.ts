import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface UserRequest {
  id: string;
  email: string;
}

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: UserRequest }>();
    const user = request.user;

    console.log('--- DECORATOR DEBUG ---');
    console.log('User object in request:', user);
    console.log('Requested data field:', data);

    if (!user) {
      return null;
    }

    if (data) {
      return user[data as keyof UserRequest];
    }
    return user;
  },
);
