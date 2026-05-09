import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from '../../entities/enrollment.entity';
import { LessonProgress } from '../../entities/lesson-progress.entity';
import { Submission } from '../../entities/submission.entity';
import { Lesson } from '../../entities/lesson.entity';
import { Course } from '../../entities/course.entity';
import { User } from '../../entities/user.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment, LessonProgress, Submission, Lesson, Course, User])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
