import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import {
  verifyRegistrationResponse,
  RegistrationResponseJSON,
} from '@simplewebauthn/server';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

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
      expectedChallenge: currentChallenge as string,
      expectedOrigin: 'http://localhost:3000', // Use your frontend origin in production
      expectedRPID: 'localhost', // Use your domain in production
    });
    if (Verification.verified && Verification.registrationInfo) {
      const { credential } = Verification.registrationInfo;
      const { counter } = credential;
      const credentialID = credential.id;
      const credentialPublicKey = credential.publicKey;

      // Store the authenticator in the database
      await this.prisma.authenticator.create({
        data: {
          userId: userId,
          credentialID: credentialID,
          publicKey: Buffer.from(credentialPublicKey),
          counter,
        },
      });
      return { success: true };
    } else {
      throw new BadRequestException('Registration verification failed');
    }
  }
}
