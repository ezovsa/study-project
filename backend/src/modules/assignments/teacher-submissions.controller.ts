import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission, SubmissionStatus } from '../../entities/submission.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../../entities/user.entity';
import { Lesson } from '../../entities/lesson.entity';
import { Course } from '../../entities/course.entity';

@Controller('teacher/submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN)
export class TeacherSubmissionsController {
  constructor(
    @InjectRepository(Submission) private subRepo: Repository<Submission>,
    @InjectRepository(Lesson) private lessonRepo: Repository<Lesson>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
  ) {}

  @Get('pending')
  async getPending(@Request() req: any) {
    const courses = await this.courseRepo.find({ where: { teacherId: req.user.id } });
    const courseIds = courses.map(c => c.id);
    if (!courseIds.length) return [];

    const lessons = await this.lessonRepo.createQueryBuilder('l')
      .where('l.courseId IN (:...ids)', { ids: courseIds })
      .getMany();
    const lessonIds = lessons.map(l => l.id);
    if (!lessonIds.length) return [];

    const subs = await this.subRepo.createQueryBuilder('s')
      .leftJoinAndSelect('s.user', 'user')
      .leftJoinAndSelect('s.assignment', 'assignment')
      .leftJoinAndSelect('assignment.lesson', 'lesson')
      .leftJoinAndSelect('lesson.course', 'course')
      .where('assignment.lessonId IN (:...lids)', { lids: lessonIds })
      .andWhere('s.status = :status', { status: SubmissionStatus.PENDING })
      .orderBy('s.submittedAt', 'ASC')
      .getMany();

    return subs;
  }

  @Get('all')
  async getAll(@Request() req: any) {
    const courses = await this.courseRepo.find({ where: { teacherId: req.user.id } });
    const courseIds = courses.map(c => c.id);
    if (!courseIds.length) return [];

    const lessons = await this.lessonRepo.createQueryBuilder('l')
      .where('l.courseId IN (:...ids)', { ids: courseIds })
      .getMany();
    const lessonIds = lessons.map(l => l.id);
    if (!lessonIds.length) return [];

    return this.subRepo.createQueryBuilder('s')
      .leftJoinAndSelect('s.user', 'user')
      .leftJoinAndSelect('s.assignment', 'assignment')
      .leftJoinAndSelect('assignment.lesson', 'lesson')
      .leftJoinAndSelect('lesson.course', 'course')
      .where('assignment.lessonId IN (:...lids)', { lids: lessonIds })
      .orderBy('s.submittedAt', 'DESC')
      .getMany();
  }
}
