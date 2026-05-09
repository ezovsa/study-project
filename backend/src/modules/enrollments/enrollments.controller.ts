import { Controller, Post, Delete, Get, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private enrollmentsService: EnrollmentsService) {}

  @Post(':id/enroll')
  enroll(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.enrollmentsService.enroll(id, req.user.id);
  }

  @Delete(':id/unenroll')
  unenroll(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.enrollmentsService.unenroll(id, req.user.id);
  }

  @Get(':id/progress')
  getProgress(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.enrollmentsService.getProgress(id, req.user.id);
  }
}
