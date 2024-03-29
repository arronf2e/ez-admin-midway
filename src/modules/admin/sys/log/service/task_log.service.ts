import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../../share/service/base.service';
import { IPageTaskLogResult } from '../../../interface';
import SysTaskLog from '../entity/task_log.entity';

@Provide()
export class AdminSysTaskLogService extends BaseService {
  @InjectEntityModel(SysTaskLog)
  taskLog: Repository<SysTaskLog>;

  /**
   * 记录任务日志
   */
  async record(tid: number, status: number): Promise<number> {
    const result = await this.taskLog.save({
      taskId: tid,
      status,
    });
    return result.id;
  }

  async updateTaskStatus(
    id: number,
    status: number,
    detail?: string
  ): Promise<void> {
    this.taskLog.update(id, {
      status,
      detail,
    });
  }

  /**
   * 计算日志总数
   */
  async count(): Promise<number> {
    return await this.taskLog.count();
  }

  /**
   * 分页加载日志信息
   */
  async page(page: number, count: number): Promise<IPageTaskLogResult[]> {
    const result = await this.taskLog
      .createQueryBuilder('task_log')
      .leftJoinAndSelect('sys_task', 'task', 'task_log.task_id = task.id')
      .orderBy('task_log.id', 'DESC')
      .offset(page * count)
      .limit(count)
      .getRawMany();
    return result.map(e => {
      return {
        id: e.task_log_id,
        taskId: e.task_id,
        name: e.task_name,
        createTime: e.task_log_createTime,
        finishTime: e.task_log_updateTime,
        detail: e.task_log_detail,
        status: e.task_log_status,
      };
    });
  }

  /**
   * 清空表中的所有数据
   */
  async clear(): Promise<void> {
    await this.taskLog.clear();
  }
}
