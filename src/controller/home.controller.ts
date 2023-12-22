import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home(): Promise<string> {
    throw new Error('bad');
    return 'Hello Midwayjs!';
  }
}
