import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('/year/:id')
  getProductById(@Param('id') id: string): string {
    return `Year: ${id}`;
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
