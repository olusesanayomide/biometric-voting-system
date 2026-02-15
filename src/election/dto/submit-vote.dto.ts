import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SelectionDto {
  @IsString()
  positionId: string;
  @IsString()
  candidateId: string;
}

export class SubmitVoteDto {
  @IsString()
  electionId: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SelectionDto)
  selections: SelectionDto[];
}
