import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Course } from '../../entities/course.entity';
import { Enrollment } from '../../entities/enrollment.entity';
import { User, UserRole } from '../../entities/user.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course) private coursesRepo: Repository<Course>,
    @InjectRepository(Enrollment) private enrollRepo: Repository<Enrollment>,
  ) {}

  async findAll(query: { category?: string; difficulty?: string; search?: string; teacherId?: number; all?: string }) {
    const qb = this.coursesRepo.createQueryBuilder('course')
      .leftJoinAndSelect('course.teacher', 'teacher')
      .leftJoinAndSelect('course.category', 'category')
      .loadRelationCountAndMap('course.lessonsCount', 'course.lessons')
      .loadRelationCountAndMap('course.enrollmentsCount', 'course.enrollments');

    if (query.teacherId) {
      // teacher sees own courses (published + drafts)
      qb.where('course.teacherId = :tid', { tid: query.teacherId });
    } else if (!query.all) {
      qb.where('course.isPublished = :pub', { pub: true });
    }
    if (query.category) qb.andWhere('category.slug = :cat', { cat: query.category });
    if (query.difficulty) qb.andWhere('course.difficulty = :diff', { diff: query.difficulty });
    if (query.search) qb.andWhere('course.title LIKE :search', { search: `%${query.search}%` });

    return qb.orderBy('course.createdAt', 'DESC').getMany();
  }

  async findOne(id: number) {
    const course = await this.coursesRepo.findOne({
      where: { id },
      relations: ['teacher', 'category', 'lessons'],
    });
    if (!course) throw new NotFoundException('Курс не найден');
    return course;
  }

  async create(dto: Partial<Course>, user: User) {
    const course = this.coursesRepo.create({ ...dto, teacherId: user.id });
    return this.coursesRepo.save(course);
  }

  async update(id: number, dto: Partial<Course>, user: User) {
    const course = await this.findOne(id);
    if (user.role !== UserRole.ADMIN && course.teacherId !== user.id)
      throw new ForbiddenException('Нет доступа');
    await this.coursesRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number, user: User) {
    const course = await this.findOne(id);
    if (user.role !== UserRole.ADMIN && course.teacherId !== user.id)
      throw new ForbiddenException('Нет доступа');
    await this.coursesRepo.delete(id);
    return { message: 'Курс удалён' };
  }

  async publish(id: number, user: User) {
    const course = await this.findOne(id);
    if (user.role !== UserRole.ADMIN && course.teacherId !== user.id)
      throw new ForbiddenException('Нет доступа');
    await this.coursesRepo.update(id, { isPublished: true });
    return { message: 'Курс опубликован' };
  }

  async getStudents(id: number) {
    return this.enrollRepo.find({
      where: { courseId: id },
      relations: ['user'],
    });
  }
}
