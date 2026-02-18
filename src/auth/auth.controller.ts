import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator'; // You'll need this decorator
import * as server from '@simplewebauthn/server';
import { BiometricVerifyDto } from './dto/bio-verify.dto';

class DevLoginDto {
  identificationNumber: string;
}
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

  @Post('login/biometric-options')
  async getBiometricOptions(
    @Body('identificationNumber') identificationNumber: string,
  ) {
    return this.authService.getAuthenticationOptions(identificationNumber);
  }

  @Post('login/biometric-verify')
  async verifyBiometricLogin(@Body() body: BiometricVerifyDto) {
    // Pass the Matric No instead of a JWT userId
    return this.authService.verifyAuthenticationResponse(
      body.identificationNumber,
      body.biometricData,
    );
  }
  // Test Login (Bypass Biometrics)
  @Post('dev-login')
  @ApiOperation({ summary: 'DEVELOPER ONLY: Get a token without biometrics' })
  @ApiBody({ type: DevLoginDto })
  async devLogin(@Body('identificationNumber') id: string) {
    // Use your existing service to generate a token for this user
    // This assumes your authService has a method like 'generateToken' or 'login'
    return this.authService.loginByIdentificationNumberTest(id);
  }
}
