// src/election/dto/update-election-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ElectionStatus } from '@prisma/client';

export class UpdateElectionStatusDto {
  @ApiProperty({
    enum: ElectionStatus,
    example: 'ONGOING',
    description: 'The next state for the election lifecycle',
  })
  @IsEnum(ElectionStatus)
  status: ElectionStatus;
}
