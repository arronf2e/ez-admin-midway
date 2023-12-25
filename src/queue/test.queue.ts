import { Processor, IProcessor } from '@midwayjs/bull';

@Processor('SysTask')
export class TestProcessor implements IProcessor {
  async execute(params) {
    // ...
    console.log(params?.name);
  }
}
