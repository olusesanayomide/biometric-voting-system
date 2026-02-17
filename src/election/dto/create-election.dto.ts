import { UserType } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateElectionDto {
  @IsString()
  @MinLength(3, { message: 'Election Title is too short' })
  title: string;

  @IsArray()
  @IsEnum(UserType, { each: true })
  @ArrayNotEmpty()
  eligibleTypes: UserType[];

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  positions: string[];
}
