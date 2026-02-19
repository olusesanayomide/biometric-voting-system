import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCandidateDto {
  @ApiProperty({
    description: 'The full name of the candidate',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The campaign manifesto or slogan',
    example: 'Progress for all students.',
  })
  @IsString()
  @IsNotEmpty()
  manifesto: string;

  @ApiProperty({
    description: 'URL to the candidate profile image',
    example: 'https://example.com/images/john-doe.jpg',
    required: false,
  })
  @IsUrl() // Ensures it's a valid link
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: 'The UUID of the position they are contesting for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID() // More specific than IsString() for database IDs
  @IsNotEmpty()
  positionId: string;

  @ApiProperty({
    description: 'The UUID of the election',
    example: '661f9511-f30c-52e5-b827-557766551111',
  })
  @IsUUID()
  @IsNotEmpty()
  electionId: string;
}
