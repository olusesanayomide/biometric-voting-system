import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // Removed JwtModuleOptions import
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtStrategy } from './strategies/jwt.strategy';
@Module({
  imports: [
    PrismaModule,
    PassportModule,
    // Use the direct register method for now
    JwtModule.register({
      secret:
        'b667b822ee375a62442a94310521b656e1042a576d50abe47e71a37381bcdfc2',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule], // Export JwtModule so other modules see this config
})
export class AuthModule {}
