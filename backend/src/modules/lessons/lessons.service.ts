import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from '../../entities/lesson.entity';
import { LessonProgress } from '../../entities/lesson-progress.entity';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson) private lessonsRepo: Repository<Lesson>,
    @InjectRepository(LessonProgress) private progressRepo: Repository<LessonProgress>,
  ) {}

  findByCourse(courseId: number) {
    return this.lessonsRepo.find({ where: { courseId }, order: { orderIndex: 'ASC' } });
  }

  async findOne(id: number) {
    const lesson = await this.lessonsRepo.findOne({ where: { id }, relations: ['assignments'] });
    if (!lesson) throw new NotFoundException('Урок не найден');
    return lesson;
  }

  create(courseId: number, dto: Partial<Lesson>) {
    const lesson = this.lessonsRepo.create({ ...dto, courseId });
    return this.lessonsRepo.save(lesson);
  }

  async update(id: number, dto: Partial<Lesson>) {
    await this.lessonsRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.lessonsRepo.delete(id);
    return { message: 'Урок удалён' };
  }

  async complete(lessonId: number, userId: number) {
    let progress = await this.progressRepo.findOne({ where: { lessonId, userId } });
    if (!progress) {
      progress = this.progressRepo.create({ lessonId, userId, isCompleted: true, visitCount: 1 });
    } else {
      progress.isCompleted = true;
    }
    return this.progressRepo.save(progress);
  }

  async updateProgress(lessonId: number, userId: number, timeSpentSec: number) {
    let progress = await this.progressRepo.findOne({ where: { lessonId, userId } });
    if (!progress) {
      progress = this.progressRepo.create({ lessonId, userId, timeSpentSec, visitCount: 1 });
    } else {
      progress.timeSpentSec += timeSpentSec;
      progress.visitCount += 1;
    }
    return this.progressRepo.save(progress);
  }
}
