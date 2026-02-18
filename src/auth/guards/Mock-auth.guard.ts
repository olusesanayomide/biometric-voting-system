import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

// For testing purposes only!
@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<any>();
    req.user = { id: 'test-user-uuid', role: 'STUDENT' };
    return true;
  }
}
