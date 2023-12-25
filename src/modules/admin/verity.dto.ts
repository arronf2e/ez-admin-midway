import { ApiProperty } from '@midwayjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

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

export class UpdatePasswordDto {
  @ApiProperty({
    type: 'string',
    example: '50',
    name: '原密码',
  })
  @IsString()
  @Expose()
  originPassword: string;

  @ApiProperty({
    type: 'string',
    example: '50',
    name: '新密码',
  })
  @IsString()
  @Expose()
  newPassword: string;
}
