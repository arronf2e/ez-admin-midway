import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { UAParser } from 'ua-parser-js';
import { BaseService } from '../../../../share/service/base.service';
import SysLoginLog from '../entity/login_log.entity';
import { Context } from '@midwayjs/koa';
import { Utils } from '../../../../../utils';
import { ILoginLogResult } from '../../interface';

@Provide()
export class AdminSysLoginLogService extends BaseService {
  @InjectEntityModel(SysLoginLog)
  loginLog: Repository<SysLoginLog>;

  @Inject()
  utils: Utils;

  @Inject()
  ctx: Context;

  /**
   * 记录登录日志
   */
  async save(id: number): Promise<void> {
    await this.loginLog.save({
      ip: this.utils.getReqIP(this.ctx),
      userId: id,
      ua: this.ctx.get('user-agent'),
    });
  }

  /**
   * 计算日志总数
   */
  async count(): Promise<number> {
    return await this.loginLog.count();
  }

  /**
   * 分页加载日志信息
   */
  async page(page: number, count: number): Promise<ILoginLogResult[]> {
    const result = await this.loginLog
      .createQueryBuilder('login_log')
      .innerJoinAndSelect('sys_user', 'user', 'login_log.user_id = user.id')
      .orderBy('login_log.createTime', 'DESC')
      .offset(page * count)
      .limit(count)
      .getRawMany();
    const parser = new UAParser();
    return result.map(e => {
      const u = parser.setUA(e.login_log_ua).getResult();
      return {
        id: e.login_log_id,
        ip: e.login_log_ip,
        os: `${u.os.name} ${u.os.version}`,
        browser: `${u.browser.name} ${u.browser.version}`,
        time: e.login_log_createTime,
        username: e.user_username,
      };
    });
  }

  /**
   * 清空表中的所有数据
   */
  async clear(): Promise<void> {
    await this.loginLog.clear();
  }
}
