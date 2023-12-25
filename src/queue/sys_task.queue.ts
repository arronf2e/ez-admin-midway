import { Processor, IProcessor } from '@midwayjs/bull';

@Processor('SysTaskQueue')
export class SysTaskQueue implements IProcessor {
  async execute() {
    // ...
  }
}
