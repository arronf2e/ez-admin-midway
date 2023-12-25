import {
  Get,
  Inject,
  Provide,
  Query,
  ALL,
  Controller,
  Post,
  Body,
} from '@midwayjs/decorator';
import {
  ADMIN_PREFIX_URL,
  BaseController,
  NOAUTH_PREFIX_URL,
} from '../../share/controller/base.controller';
import { AdminVerifyService } from '../verify.service';
import { res } from '../../../utils';
import { AdminSysUserService } from '../sys/user/user.service';
import { LoginImageCaptchaDto } from '../verity.dto';
import { ResOp } from '../../../interface';
import { isEmpty } from 'lodash';
import { Validate } from '@midwayjs/validate';
import { LoginInfoDto } from '../verify';

@Provide()
@Controller(`${ADMIN_PREFIX_URL}${NOAUTH_PREFIX_URL}/`, {
  tagName: 'AdminLogin',
  description: '后台登录控制器',
})
export class AdminLoginController extends BaseController {
  @Inject()
  adminVerifyService: AdminVerifyService;

  @Inject()
  adminSysUserService: AdminSysUserService;

  @Get('/captcha/img')
  async captchaByImg(
    @Query(ALL) captcha: LoginImageCaptchaDto
  ): Promise<ResOp> {
    const result = await this.adminVerifyService.getImgCaptcha(captcha);
    return res({ data: result });
  }

  @Post('/login')
  @Validate()
  async login(@Body(ALL) loginInfo: LoginInfoDto): Promise<ResOp> {
    const isSuccess = await this.adminVerifyService.checkImgCaptcha(
      loginInfo.captchaId,
      loginInfo.verifyCode
    );
    if (!isSuccess) {
      return res({ code: 10002 });
    }
    const sign = await this.adminVerifyService.getLoginSign(
      loginInfo.username,
      loginInfo.password
    );
    if (isEmpty(sign)) {
      return res({ code: 10003 });
    }
    return res({ data: { token: sign } });
  }
}
