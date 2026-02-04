import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateRegistrationOptions } from '@simplewebauthn/server';

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
      rpID: 'localhost', // Use your domain in production
      userID: user.id,
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
      data: { otpCode: options.challenge }, // Reusing otpCode field as a temporary challenge store
    });

    return options;
  }
}
