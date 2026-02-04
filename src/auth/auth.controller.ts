import { Controller, Post, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

ApiTags('Authentication');
@Controller('auth')
export class AuthController {
  constructor(private AuthService: AuthService) {}

  @Post('register/challenge/:userid')
  @ApiOperation({ summary: 'Generate registration challenge for a user' })
  @ApiResponse({
    status: 201,
    description: 'Registration challenge generated successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getRegistrationChallenge(@Param('userid') userId: string) {
    return this.AuthService.getRegistrationOptions(userId);
  }
}
