import { ApiProperty } from '@midwayjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt } from 'class-validator';

export class LoginImageCaptchaDto {
  @ApiProperty({
    type: 'number',
    example: '100',
  })
  @IsInt()
  @Expose()
  width: number;

  @ApiProperty({
    type: 'number',
    example: '50',
  })
  @IsInt()
  @Expose()
  height: number;
}
