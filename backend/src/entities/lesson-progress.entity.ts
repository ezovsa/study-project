import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Lesson } from './lesson.entity';

@Entity('lesson_progress')
export class LessonProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, u => u.lessonProgresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Lesson, l => l.progresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column()
  lessonId: number;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: 0 })
  timeSpentSec: number;

  @Column({ default: 0 })
  visitCount: number;

  @UpdateDateColumn()
  lastVisitedAt: Date;
}
