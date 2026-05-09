import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class AssignmentsController {
  constructor(private assignmentsService: AssignmentsService) {}

  @Get('assignments/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.assignmentsService.findOne(id);
  }

  @Get('lessons/:lessonId/assignments')
  findByLesson(@Param('lessonId', ParseIntPipe) lessonId: number) {
    return this.assignmentsService.findByLesson(lessonId);
  }

  @Post('lessons/:lessonId/assignments')
  create(@Param('lessonId', ParseIntPipe) lessonId: number, @Body() dto: any) {
    return this.assignmentsService.create(lessonId, dto);
  }

  @Patch('assignments/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.assignmentsService.update(id, dto);
  }

  @Delete('assignments/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.assignmentsService.remove(id);
  }

  @Post('assignments/:id/submit')
  submit(@Param('id', ParseIntPipe) id: number, @Body('answerText') answer: string, @Request() req) {
    return this.assignmentsService.submit(id, req.user.id, answer);
  }

  @Patch('submissions/:id/grade')
  grade(@Param('id', ParseIntPipe) id: number, @Body() dto: { score: number; feedback: string }) {
    return this.assignmentsService.grade(id, dto.score, dto.feedback);
  }
}
