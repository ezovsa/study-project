import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Assignment } from './assignment.entity';

export enum SubmissionStatus {
  PENDING = 'pending',
  GRADED = 'graded',
}

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, u => u.submissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Assignment, a => a.submissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assignmentId' })
  assignment: Assignment;

  @Column()
  assignmentId: number;

  @Column({ default: 1 })
  attemptNumber: number;

  @Column({ type: 'text', nullable: true })
  answerText: string;

  @Column({ nullable: true, type: 'real' })
  score: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Column({ type: 'text', default: SubmissionStatus.PENDING })
  status: SubmissionStatus;

  @CreateDateColumn()
  submittedAt: Date;

  @Column({ nullable: true })
  gradedAt: Date;
}
