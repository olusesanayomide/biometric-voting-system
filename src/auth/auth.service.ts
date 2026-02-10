import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import {
  verifyRegistrationResponse,
  RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async loginWithPin(idNumber: string, pin: string) {
    // 1. Find user
    const user = await this.prisma.user.findUnique({
      where: { identificationNumber: idNumber },
    });

    // 2. Check if user exists AND has a PIN set
    if (!user || !user.secretPin) {
      throw new UnauthorizedException('Invalid credentials');
    }
    console.log(
      'Comparing input:',
      pin,
      'against stored hash:',
      user.secretPin,
    );
    // 3. Compare PIN (Now safe because user.secretPin is guaranteed to be a string)
    const isPinValid = await bcrypt.compare(pin, user.secretPin);
    if (!isPinValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. DEFINE the payload (Fixes "Cannot find name 'payload'")
    const payload = {
      sub: user.id,
      email: user.email,
    };

    // 5. Sign and return
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async getRegistrationOptions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { authenticators: true },
    });

    if (!user) throw new Error('User not found');

    const options = await generateRegistrationOptions({
      rpName: 'University BVS',
      rpID: 'localhost', // Use domain in production
      userID: Uint8Array.from(Buffer.from(user.id)),
      userName: user.email,
      attestationType: 'none',
      // Prevent registering the same device twice
      excludeCredentials: user.authenticators.map((auth) => ({
        id: auth.credentialID,
        type: 'public-key',
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform', // Forces phone/laptop biometrics
      },
    });

    // CRITICAL: Save the challenge temporarily to the user record
    // or a cache so we can verify it in the next step
    await this.prisma.user.update({
      where: { id: userId },
      data: { currentChallenge: options.challenge }, // Reusing otpCode field as a temporary challenge store
    });

    return options;
  }
  async verifyRegistrationResponse(
    userId: string,
    body: RegistrationResponseJSON,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const { currentChallenge = '' } = user ?? {};
    if (!currentChallenge) {
      throw new BadRequestException(
        'Registration session expired or not found',
      );
    }

    const Verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: currentChallenge,
      expectedOrigin: 'http://localhost:3000', // Use your frontend origin in production
      expectedRPID: 'localhost', // Use your domain in production
    });
    if (Verification.verified && Verification.registrationInfo) {
      const { credential } = Verification.registrationInfo;
      const { counter } = credential;
      const credentialID = credential.id;
      const credentialPublicKey = credential.publicKey;

      // Store the authenticator in the database
      await this.prisma.$transaction([
        this.prisma.authenticator.create({
          data: {
            userId: userId,
            credentialID: credentialID,
            publicKey: Buffer.from(credentialPublicKey),
            counter,
          },
        }),
        this.prisma.user.update({
          where: { id: userId },
          data: { currentChallenge: null },
        }),
      ]);
      return { success: true };
    } else {
      throw new BadRequestException('Registration verification failed');
    }
  }
}
