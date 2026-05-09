import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Category } from './entities/category.entity';
import { Course } from './entities/course.entity';
import { Lesson } from './entities/lesson.entity';
import { Assignment } from './entities/assignment.entity';
import { Enrollment } from './entities/enrollment.entity';
import { LessonProgress } from './entities/lesson-progress.entity';
import { Submission } from './entities/submission.entity';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SeedModule } from './seed/seed.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_PATH || 'database.sqlite',
      entities: [
        User,
        Category,
        Course,
        Lesson,
        Assignment,
        Enrollment,
        LessonProgress,
        Submission,
      ],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    CoursesModule,
    LessonsModule,
    AssignmentsModule,
    EnrollmentsModule,
    AnalyticsModule,
    ReportsModule,
    SeedModule,
  ],
})
export class AppModule {}
