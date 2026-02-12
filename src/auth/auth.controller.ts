import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator'; // You'll need this decorator
import * as server from '@simplewebauthn/server';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login-pin')
  @ApiOperation({ summary: 'Login with ID and PIN to get JWT' })
  async login(@Body() body: { identificationNumber: string; pin: string }) {
    return this.authService.loginWithPin(body.identificationNumber, body.pin);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('register/challenge')
  @ApiOperation({
    summary: 'Generate registration challenge for the logged-in user',
  })
  async getRegistrationChallenge(@GetUser('id') userId: string) {
    return this.authService.getRegistrationOptions(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('register/verify')
  @ApiOperation({ summary: 'Verify and save biometric registration' })
  async verifyRegistration(
    @GetUser('id') userId: string,
    @Body() body: server.RegistrationResponseJSON,
  ) {
    return this.authService.verifyRegistrationResponse(userId, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('login/biometric-options')
  async getLoginOptions(@GetUser('id') userId: string) {
    return this.authService.getAuthenticationOptions(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('login/biometric-verify')
  async verifyBiometricLogin(
    @GetUser('id') userId: string,
    @Body() body: server.AuthenticationResponseJSON,
  ) {
    return this.authService.verifyAuthenticationResponse(userId, body);
  }
}
