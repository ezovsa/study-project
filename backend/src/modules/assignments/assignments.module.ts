import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from '../../entities/assignment.entity';
import { Submission } from '../../entities/submission.entity';
import { Lesson } from '../../entities/lesson.entity';
import { Course } from '../../entities/course.entity';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { TeacherSubmissionsController } from './teacher-submissions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Assignment, Submission, Lesson, Course])],
  controllers: [AssignmentsController, TeacherSubmissionsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
