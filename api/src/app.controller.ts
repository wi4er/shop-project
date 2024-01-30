import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

  @Get()
  getHello(): string {
    return `
    <div style="display: flex; justify-content: center;align-items: center;height: 100vh; font-size: 72px">
        >>> Shop project here <<<
    </div>
    `;
  }

}
