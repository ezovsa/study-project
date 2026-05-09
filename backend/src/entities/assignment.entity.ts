import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Lesson } from './lesson.entity';
import { Submission } from './submission.entity';

export enum AssignmentType {
  QUIZ = 'quiz',
  TEXT = 'text',
  FILE = 'file',
}

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', default: AssignmentType.TEXT })
  type: AssignmentType;

  @Column({ default: 100 })
  maxScore: number;

  @Column({ nullable: true })
  deadline: Date;

  @Column({ default: 1 })
  attemptsAllowed: number;

  @ManyToOne(() => Lesson, l => l.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column()
  lessonId: number;

  @OneToMany(() => Submission, s => s.assignment)
  submissions: Submission[];

  @CreateDateColumn()
  createdAt: Date;
}
