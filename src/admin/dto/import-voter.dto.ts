import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class VoterImportItem {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '21/1234' })
  idNum: string;

  @IsEmail()
  @ApiProperty({ example: 'student@university.edu' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Adewale Ciroma' })
  name: string;
}

export class ImportVotersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VoterImportItem)
  @ApiProperty({ type: [VoterImportItem] })
  voters: VoterImportItem[];
}
