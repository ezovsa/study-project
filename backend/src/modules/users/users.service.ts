import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Enrollment } from '../../entities/enrollment.entity';
import { Submission } from '../../entities/submission.entity';
import { LessonProgress } from '../../entities/lesson-progress.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Enrollment) private enrollRepo: Repository<Enrollment>,
    @InjectRepository(Submission) private subRepo: Repository<Submission>,
    @InjectRepository(LessonProgress) private progressRepo: Repository<LessonProgress>,
  ) {}

  async findAll() {
    return this.usersRepo.find({ select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'] });
  }

  async findOne(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    const { passwordHash, ...result } = user;
    return result;
  }

  async update(id: number, dto: Partial<User>) {
    await this.usersRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.usersRepo.delete(id);
    return { message: 'Пользователь удалён' };
  }

  async getStats(id: number) {
    const enrollments = await this.enrollRepo.find({ where: { userId: id }, relations: ['course'] });
    const submissions = await this.subRepo.find({ where: { userId: id } });
    const progresses = await this.progressRepo.find({ where: { userId: id } });

    const gradedSubs = submissions.filter(s => s.score !== null);
    const avgScore = gradedSubs.length ? gradedSubs.reduce((a, b) => a + b.score, 0) / gradedSubs.length : 0;
    const totalTimeSec = progresses.reduce((a, b) => a + b.timeSpentSec, 0);
    const completedLessons = progresses.filter(p => p.isCompleted).length;
    const completedCourses = enrollments.filter(e => e.completedAt).length;

    return {
      totalCourses: enrollments.length,
      completedCourses,
      completedLessons,
      totalAssignments: submissions.length,
      avgScore: Math.round(avgScore * 10) / 10,
      totalHours: Math.round(totalTimeSec / 3600 * 10) / 10,
    };
  }
}
