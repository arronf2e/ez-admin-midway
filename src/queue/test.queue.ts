import { Processor, IProcessor } from '@midwayjs/bull';

@Processor('test')
export class TestProcessor implements IProcessor {
  async execute(params) {
    // ...
    console.log(params?.name);
  }
}
