import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from '../../entities/assignment.entity';
import { Submission, SubmissionStatus } from '../../entities/submission.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment) private assignRepo: Repository<Assignment>,
    @InjectRepository(Submission) private subRepo: Repository<Submission>,
  ) {}

  findByLesson(lessonId: number) {
    return this.assignRepo.find({ where: { lessonId } });
  }

  async findOne(id: number) {
    const a = await this.assignRepo.findOne({ where: { id } });
    if (!a) throw new NotFoundException('Задание не найдено');
    return a;
  }

  create(lessonId: number, dto: Partial<Assignment>) {
    const a = this.assignRepo.create({ ...dto, lessonId });
    return this.assignRepo.save(a);
  }

  async update(id: number, dto: Partial<Assignment>) {
    await this.assignRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.assignRepo.delete(id);
    return { message: 'Задание удалено' };
  }

  async submit(assignmentId: number, userId: number, answerText: string) {
    const assignment = await this.findOne(assignmentId);
    const existing = await this.subRepo.count({ where: { assignmentId, userId } });
    if (existing >= assignment.attemptsAllowed)
      throw new BadRequestException('Превышено количество попыток');
    const sub = this.subRepo.create({
      assignmentId, userId, answerText,
      attemptNumber: existing + 1,
      status: SubmissionStatus.PENDING,
    });
    return this.subRepo.save(sub);
  }

  async grade(submissionId: number, score: number, feedback: string) {
    const sub = await this.subRepo.findOne({ where: { id: submissionId } });
    if (!sub) throw new NotFoundException('Ответ не найден');
    sub.score = score;
    sub.feedback = feedback;
    sub.status = SubmissionStatus.GRADED;
    sub.gradedAt = new Date();
    return this.subRepo.save(sub);
  }
}
