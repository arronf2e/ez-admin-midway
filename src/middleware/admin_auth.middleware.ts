import { Provide } from '@midwayjs/core';
import {
  Context,
  IMidwayKoaContext,
  IWebMiddleware,
  NextFunction,
} from '@midwayjs/koa';
import { Middleware, DefaultState } from 'koa';
import { Utils, res } from '../utils';
import { AdminVerifyService } from '../modules/admin/verify.service';
import { isEmpty } from 'lodash';
import { ResOp } from '../interface';

// 无需token的地址
const noTokenUrl = ['/admin/public/captcha/img', '/admin/public/login'];

// 无需权限的url
const noPermUrl = ['/admin/permmenu', '/admin/person', '/admin/logout'];

@Provide()
export class AdminAuthMiddleware implements IWebMiddleware {
  resolve(): Middleware<DefaultState, IMidwayKoaContext, any> {
    return async (ctx: Context, next: NextFunction) => {
      const url = ctx.url;
      const path = url.split('?')[0];
      const token = ctx.get('Authorization');
      if (url.startsWith('/admin/')) {
        if (noTokenUrl.includes(path)) {
          await next();
          return;
        }
        const utils = await ctx.requestContext.getAsync(Utils);
        try {
          // 挂载对象到当前请求上
          ctx.admin = utils.jwtVerify(token);
        } catch (e) {
          // 无法通过token校验
          this.reject(ctx, 401, { code: 11001 });
          return;
        }
        // token校验通过，则校验权限
        if (noPermUrl.includes(path)) {
          // 无需权限，则pass
          await next();
          return;
        }
        const verifyService = await ctx.requestContext.getAsync(
          AdminVerifyService
        );
        const pv = await verifyService.getRedisPasswordVersionById(
          ctx.admin.uid
        );
        if (pv !== `${ctx.admin.pv}`) {
          // 密码版本不一致，登录期间已更改过密码
          this.reject(ctx, 401, { code: 11002 });
          return;
        }
        const redisToken = await verifyService.getRedisTokenById(ctx.admin.uid);
        if (token !== redisToken) {
          // 与redis保存不一致
          this.reject(ctx, 401, { code: 11002 });
          return;
        }
        const perms: string = await verifyService.getRedisPermsById(
          ctx.admin.uid
        );
        // 安全判空
        if (isEmpty(perms)) {
          this.reject(ctx, 403, { code: 11001 });
          return;
        }
        // 将sys:admin:user等转换成sys/admin/user
        const permArray: string[] = (JSON.parse(perms) as string[]).map(e => {
          return e.replace(/:/g, '/');
        });
        // 遍历权限是否包含该url，不包含则无访问权限
        if (!permArray.includes(path.replace('/admin/', ''))) {
          this.reject(ctx, 403, { code: 11003 });
          return;
        }
      }
      // pass
      await next();
    };
  }

  reject(ctx: Context, status: number, op: ResOp): void {
    ctx.status = status;
    ctx.body = res(op);
  }
}
