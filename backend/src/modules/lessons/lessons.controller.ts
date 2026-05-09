import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Get('courses/:courseId/lessons')
  findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.lessonsService.findByCourse(courseId);
  }

  @Get('lessons/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lessonsService.findOne(id);
  }

  @Post('courses/:courseId/lessons')
  create(@Param('courseId', ParseIntPipe) courseId: number, @Body() dto: any) {
    return this.lessonsService.create(courseId, dto);
  }

  @Patch('lessons/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.lessonsService.update(id, dto);
  }

  @Delete('lessons/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lessonsService.remove(id);
  }

  @Post('lessons/:id/complete')
  complete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.lessonsService.complete(id, req.user.id);
  }

  @Patch('lessons/:id/progress')
  updateProgress(@Param('id', ParseIntPipe) id: number, @Body('timeSpentSec') time: number, @Request() req) {
    return this.lessonsService.updateProgress(id, req.user.id, time || 0);
  }
}
