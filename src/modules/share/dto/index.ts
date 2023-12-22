import { Expose, Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PagePostDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Expose()
  limit: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Expose()
  page: number;
}

export class PageGetDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(v => parseInt(v.value), { toClassOnly: true })
  @Expose()
  limit: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(v => parseInt(v.value), { toClassOnly: true })
  @Expose()
  page: number;
}
