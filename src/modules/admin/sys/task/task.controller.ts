import {
  Provide,
  Controller,
  Inject,
  Get,
  Query,
  ALL,
  Post,
  Body,
} from '@midwayjs/core';
import { isEmpty } from 'class-validator';
import { ResOp } from '../../../../interface';
import { resByPage, res } from '../../../../utils';
import {
  ADMIN_PREFIX_URL,
  BaseController,
} from '../../../share/controller/base.controller';
import { CreateTaskDto, UpdateTaskDto, CheckIdTaskDto } from './task.dto';
import { AdminSysTaskService } from './task.service';
import { Validate } from '@midwayjs/validate';
import { PageGetDto } from '../../../share/dto/base.dto';

@Provide()
@Controller(`${ADMIN_PREFIX_URL}/sys/task`, {
  tagName: 'AdminSysTask',
  description: '后台系统定时任务控制器',
})
export class AdminSysTaskController extends BaseController {
  @Inject()
  adminSysTaskService: AdminSysTaskService;

  @Get('/page')
  @Validate()
  async page(@Query(ALL) dto: PageGetDto): Promise<ResOp> {
    const list = await this.adminSysTaskService.page(dto.page - 1, dto.limit);
    const count = await this.adminSysTaskService.count();
    return resByPage(list, count, dto.page, dto.limit);
  }

  @Post('/add')
  @Validate()
  async add(@Body(ALL) dto: CreateTaskDto): Promise<ResOp> {
    await this.adminSysTaskService.addOrUpdate(dto);
    return res();
  }

  @Post('/update')
  @Validate()
  async update(@Body(ALL) dto: UpdateTaskDto): Promise<ResOp> {
    await this.adminSysTaskService.addOrUpdate(dto);
    return res();
  }

  @Get('/info')
  @Validate()
  async info(@Query(ALL) dto: CheckIdTaskDto): Promise<ResOp> {
    return res({
      data: await this.adminSysTaskService.info(dto.id),
    });
  }

  @Post('/once')
  @Validate()
  async once(@Body(ALL) dto: CheckIdTaskDto): Promise<ResOp> {
    const task = await this.adminSysTaskService.info(dto.id);
    if (!isEmpty(task)) {
      await this.adminSysTaskService.once(task);
    }
    return res();
  }

  @Post('/stop')
  @Validate()
  async stop(@Body(ALL) dto: CheckIdTaskDto): Promise<ResOp> {
    const task = await this.adminSysTaskService.info(dto.id);
    if (!isEmpty(task)) {
      await this.adminSysTaskService.stop(task);
    }
    return res();
  }

  @Post('/start')
  @Validate()
  async start(@Body(ALL) dto: CheckIdTaskDto): Promise<ResOp> {
    const task = await this.adminSysTaskService.info(dto.id);
    if (!isEmpty(task)) {
      await this.adminSysTaskService.start(task);
    }
    return res();
  }

  @Post('/delete')
  @Validate()
  async delete(@Body(ALL) dto: CheckIdTaskDto): Promise<ResOp> {
    const task = await this.adminSysTaskService.info(dto.id);
    if (!isEmpty(task)) {
      await this.adminSysTaskService.delete(task);
    }
    return res();
  }
}
