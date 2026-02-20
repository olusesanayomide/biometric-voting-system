// src/election/dto/create-election.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { UserType } from '@prisma/client';

export class CreateElectionDto {
  @ApiProperty({ example: '2026 Student Union Government' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: ['STUDENT'],
    enum: UserType,
    isArray: true,
  })
  @IsArray()
  @IsEnum(UserType, { each: true }) // Checks each item in the array
  eligibleTypes: UserType[];

  @ApiProperty({
    example: ['President', 'Vice President'],
    description: 'List of positions',
  })
  @IsArray()
  @IsString({ each: true })
  positions: string[];
}
