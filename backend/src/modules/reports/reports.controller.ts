import { Controller, Get, Post, Param, Query, Body, UseGuards, Res, ParseIntPipe } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('student/:id')
  async studentReport(@Param('id', ParseIntPipe) id: number, @Query('format') format = 'json', @Res() res: Response) {
    const result = await this.reportsService.studentReport(id, format);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.send(result.content);
  }

  @Get('course/:id')
  async courseReport(@Param('id', ParseIntPipe) id: number, @Query('format') format = 'json', @Res() res: Response) {
    const result = await this.reportsService.courseReport(id, format);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.send(result.content);
  }

  @Get('platform')
  async platformReport(@Query('format') format = 'json', @Res() res: Response) {
    const result = await this.reportsService.platformReport(format);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.send(result.content);
  }

  @Post('schedule')
  scheduleReport(@Body() dto: any) {
    return this.reportsService.scheduleReport(dto);
  }
}
