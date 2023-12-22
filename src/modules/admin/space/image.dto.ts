import { Expose } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsInt,
  IsNumberString,
  Length,
} from 'class-validator';
import { PageGetDto } from '../../share/dto/base.dto';

export class DeleteTypeDto {
  @IsInt()
  @Expose()
  typeId: number;
}

export class CreateTypeDto {
  @Length(2)
  @Expose()
  name: string;
}

export class QueryImageDto extends PageGetDto {
  @IsNumberString()
  @Expose()
  typeId: string;
}

export class DeleteImageDto {
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @Expose()
  imageIds: number[];
}

export class UploadImageDto {
  @IsNumberString()
  @Expose()
  typeId: string;
}
