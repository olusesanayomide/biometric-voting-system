import type { AuthenticationResponseJSON } from '@simplewebauthn/types';
import { IsString, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BiometricVerifyDto {
  @ApiProperty({
    description: 'The student Matric Number or Staff ID',
    example: '19/4082',
  })
  @IsString()
  @IsNotEmpty()
  identificationNumber: string;

  @ApiProperty({
    description:
      'The credential assertion response from the browser WebAuthn API',
  })
  @IsObject()
  @IsNotEmpty()
  // This is the actual cryptographic data package
  biometricData: AuthenticationResponseJSON;
}
