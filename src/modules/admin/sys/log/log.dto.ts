import { IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { PageGetDto } from '../../../share/dto';

export class SearchLogDto extends PageGetDto {
  @IsString()
  @Expose()
  q: string;
}
