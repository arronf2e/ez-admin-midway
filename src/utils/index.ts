import { Config, Provide, Scope, ScopeEnum } from '@midwayjs/core';
import { Context } from 'koa';
import * as CryptoJS from 'crypto-js';
import * as JsonWebToken from 'jsonwebtoken';
import { customAlphabet, nanoid } from 'nanoid';
import ErrorConstants from '../constant/error_constants';
import { ResOp } from '../interface';

export function res(op?: ResOp): ResOp {
  return {
    data: op?.data ?? null,
    code: op?.code ?? 200,
    message: op?.code
      ? getErrorMessageByCode(op!.code) || op?.message || 'unknown error'
      : op?.message || 'success',
  };
}

export function resByPage<V>(
  list: V,
  total: number,
  page: number,
  size: number
): ResOp {
  return res({
    data: {
      list,
      pagination: {
        total,
        page,
        size,
      },
    },
  });
}

/**
 * 根据code获取错误信息
 */
export function getErrorMessageByCode(code: number): string {
  return ErrorConstants[code];
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class Utils {
  @Config('jwt')
  jwt;

  /**
   * 获取请求IP
   */
  getReqIP(ctx: Context) {
    const req: any = ctx.req;
    return (
      req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
      req.connection.remoteAddress || // 判断 connection 的远程 IP
      req.socket.remoteAddress || // 判断后端的 socket 的 IP
      req.connection.socket.remoteAddress
    ).replace('::ffff:', '');
  }

  /**
   * AES加密
   */
  aesEncrypt(msg: string, secret: string) {
    return CryptoJS.AES.encrypt(msg, secret).toString();
  }

  /**
   * AES解密
   */
  aesDecrypt(encrypted: string, secret: string): string {
    return CryptoJS.AES.decrypt(encrypted, secret).toString(CryptoJS.enc.Utf8);
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
    placeholder = '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
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
