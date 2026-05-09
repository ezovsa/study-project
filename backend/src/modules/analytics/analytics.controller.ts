import { Controller, Get, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('student/:id/overview')
  studentOverview(@Param('id', ParseIntPipe) id: number) {
    return this.analyticsService.studentOverview(id);
  }

  @Get('student/:id/courses')
  studentCourses(@Param('id', ParseIntPipe) id: number) {
    return this.analyticsService.studentCourses(id);
  }

  @Get('student/:id/activity')
  studentActivity(@Param('id', ParseIntPipe) id: number) {
    return this.analyticsService.studentActivity(id);
  }

  @Get('student/:id/weak-spots')
  studentWeakSpots(@Param('id', ParseIntPipe) id: number) {
    return this.analyticsService.studentWeakSpots(id);
  }

  @Get('course/:id/overview')
  courseOverview(@Param('id', ParseIntPipe) id: number) {
    return this.analyticsService.courseOverview(id);
  }

  @Get('course/:id/students')
  courseStudents(@Param('id', ParseIntPipe) id: number) {
    return this.analyticsService.courseStudents(id);
  }

  @Get('course/:id/lessons')
  courseLessons(@Param('id', ParseIntPipe) id: number) {
    return this.analyticsService.courseLessons(id);
  }

  @Get('course/:id/assignments')
  courseAssignments(@Param('id', ParseIntPipe) id: number) {
    return this.analyticsService.courseAssignments(id);
  }

  @Get('platform/overview')
  platformOverview() {
    return this.analyticsService.platformOverview();
  }

  @Get('platform/top-courses')
  platformTopCourses() {
    return this.analyticsService.platformTopCourses();
  }

  @Get('platform/completion-rate')
  platformCompletionRate() {
    return this.analyticsService.platformCompletionRate();
  }
}
