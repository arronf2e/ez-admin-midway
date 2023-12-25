import { Config, Provide } from '@midwayjs/core';
import { Context } from 'koa';
import * as CryptoJS from 'crypto-js';
import * as JsonWebToken from 'jsonwebtoken';
import { customAlphabet, nanoid } from 'nanoid';
import ErrorConstants from '../constant/error_constants';

@Provide()
export class Utils {
  @Config('jwt')
  jwt;

  /**
   * 获取请求IP
   */
  getReqIp(ctx: Context) {
    const req: any = ctx.req;
    return (
      req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
      req.connection.remoteAddress || // 判断 connection 的远程 IP
      req.socket.remoteAddress || // 判断后端的 socket 的 IP
      req.connection.socket.remoteAddress
    ).replace('::ffff:', '');
  }

  /**
   * 根据code获取错误信息
   */
  getErrorMessageByCode(code: number) {
    return ErrorConstants[code];
  }

  /**
   * AES加密
   */
  aesEncrypt(msg: string, secret: string) {
    return CryptoJS.AES.encrypt(msg, secret).toString();
  }

  /**
   * md5加密
   */
  md5(msg: string) {
    return CryptoJS.MD5(msg).toString();
  }

  /**
   * 生成一个UUID
   */
  generateUUID() {
    return nanoid();
  }

  /**
   * 生成一个随机的值
   */
  generateRandomValue(
    length: number,
    placeholder = '1234567890qwertyuiopasdfghjklzxcvbnm'
  ) {
    const nanoid = customAlphabet(placeholder, length);
    return nanoid();
  }

  /**
   * JsonWebToken Sign
   * https://github.com/auth0/node-jsonwebtoken
   */
  jwtSign(sign: any, options?: any) {
    return JsonWebToken.sign(sign, this.jwt.secret, options);
  }

  /**
   * JsonWebToken Verify
   * https://github.com/auth0/node-jsonwebtoken
   */
  jwtVerify(token: string, options?: any) {
    return JsonWebToken.verify(token, this.jwt.secret, options);
  }
}
