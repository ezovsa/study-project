import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../../entities/course.entity';
import { Enrollment } from '../../entities/enrollment.entity';
import { Category } from '../../entities/category.entity';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CategoriesController } from './categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Enrollment, Category])],
  controllers: [CoursesController, CategoriesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
