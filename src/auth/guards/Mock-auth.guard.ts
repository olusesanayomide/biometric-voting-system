// mock-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class MockAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // 1. Manually set the "user" for testing.
    // FLIP THIS: Change to 'STUDENT' or 'ADMIN' depending on what you are testing.
    request.user = {
      id: 'mock-id-123',
      role: 'ADMIN',
      identificationNumber: '22/0001',
    };

    // 2. Check if the endpoint has a @Roles() decorator
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true; // No roles required? Let them in.
    }

    // 3. Check if the mock user's role matches
    return requiredRoles.includes(request.user.role);
  }
}
