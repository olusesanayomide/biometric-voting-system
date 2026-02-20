import { ApiProperty } from '@nestjs/swagger';

// src/election/dto/election-response.dto.ts
export class ElectionCreatedResponseDto {
  @ApiProperty({ example: 'clm123abc' })
  id: string;

  @ApiProperty({ example: '2026 Student Union Government' })
  title: string;

  @ApiProperty({ example: 'DRAFT' })
  status: string;

  @ApiProperty({ example: '2026-02-20T10:00:00Z' })
  createdAt: Date;
}
