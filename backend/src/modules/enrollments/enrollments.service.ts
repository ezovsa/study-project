import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../../entities/enrollment.entity';
import { Lesson } from '../../entities/lesson.entity';
import { LessonProgress } from '../../entities/lesson-progress.entity';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment) private enrollRepo: Repository<Enrollment>,
    @InjectRepository(Lesson) private lessonsRepo: Repository<Lesson>,
    @InjectRepository(LessonProgress) private progressRepo: Repository<LessonProgress>,
  ) {}

  async enroll(courseId: number, userId: number) {
    const exists = await this.enrollRepo.findOne({ where: { courseId, userId } });
    if (exists) throw new ConflictException('Вы уже записаны на этот курс');
    const enrollment = this.enrollRepo.create({ courseId, userId });
    return this.enrollRepo.save(enrollment);
  }

  async unenroll(courseId: number, userId: number) {
    const enrollment = await this.enrollRepo.findOne({ where: { courseId, userId } });
    if (!enrollment) throw new NotFoundException('Запись не найдена');
    await this.enrollRepo.delete(enrollment.id);
    return { message: 'Вы отписались от курса' };
  }

  async getProgress(courseId: number, userId: number) {
    const enrollment = await this.enrollRepo.findOne({ where: { courseId, userId } });
    if (!enrollment) throw new NotFoundException('Вы не записаны на этот курс');

    const lessons = await this.lessonsRepo.find({ where: { courseId } });
    const progresses = await this.progressRepo.find({ where: { userId } });
    const progressMap = new Map(progresses.map(p => [p.lessonId, p]));

    const lessonsWithProgress = lessons.map(l => ({
      ...l,
      progress: progressMap.get(l.id) || null,
    }));

    const completed = lessons.filter(l => progressMap.get(l.id)?.isCompleted).length;
    const percent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;

    return {
      enrollment,
      totalLessons: lessons.length,
      completedLessons: completed,
      percent,
      lessons: lessonsWithProgress,
    };
  }
}
