import {
  Get,
  Inject,
  Provide,
  Query,
  ALL,
  Controller,
} from '@midwayjs/decorator';
import {
  ADMIN_PREFIX_URL,
  BaseController,
  NOAUTH_PREFIX_URL,
} from '../../share/controller/base.controller';
import { IImageCaptchaOptions } from '../interface';
import { AdminVerifyService } from '../verify.service';
import { res } from '../../../utils';

@Provide()
@Controller(`${ADMIN_PREFIX_URL}${NOAUTH_PREFIX_URL}/`, {
  tagName: 'AdminLogin',
  description: '后台登录控制器',
})
export class AdminLoginController extends BaseController {
  @Inject()
  adminVerifyService: AdminVerifyService;

  @Get('/captcha/img')
  async captchaByImg(@Query(ALL) query: IImageCaptchaOptions): Promise<any> {
    const result = await this.adminVerifyService.getImgCaptcha(query);
    return res({ data: result });
  }
}
