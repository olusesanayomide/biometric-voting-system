// src/auth/dto/login-test.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginTestDto {
  @ApiProperty({
    description: 'The Matric Number or Staff ID of the user',
    example: '22/0001', // This makes the Swagger body NOT blank!
  })
  @IsString()
  @IsNotEmpty()
  identificationNumber: string;
}
