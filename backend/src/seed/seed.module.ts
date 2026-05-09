import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Course } from '../entities/course.entity';
import { Lesson } from '../entities/lesson.entity';
import { Assignment } from '../entities/assignment.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { LessonProgress } from '../entities/lesson-progress.entity';
import { Submission } from '../entities/submission.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Category, Course, Lesson, Assignment, Enrollment, LessonProgress, Submission])],
  providers: [SeedService],
})
export class SeedModule {}
