import { Length, IsString, IsEmail, ValidateIf, Allow } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@midwayjs/swagger';

export class LoginInfoDto {
  @ApiProperty({
    type: 'string',
    example: 'admin',
  })
  @IsString()
  @Expose()
  username: string;

  @ApiProperty({
    type: 'string',
    example: 'password123',
  })
  @IsString()
  @Expose()
  password: string;

  @ApiProperty({
    type: 'string',
    example: '1234',
  })
  @IsString()
  @Expose()
  captchaId: string;

  @ApiProperty({
    type: 'string',
    example: '1234',
  })
  @Length(4)
  @Expose()
  verifyCode: string;
}

export class UpdatePersonInfoDto {
  @Length(2, 20)
  @Expose()
  name: string;

  @Allow()
  @Expose()
  nickName: string;

  @ValidateIf((_o, v) => {
    return !(v === '' || v === undefined || v === null);
  })
  @IsEmail()
  @Expose()
  email: string;

  @Allow()
  @Expose()
  phone: string;

  @Allow()
  @Expose()
  originPassword: string;

  @Allow()
  @Expose()
  newPassword: string;

  @Allow()
  @Expose()
  remark: string;

  @Allow()
  @Expose()
  headImg: string;
}
