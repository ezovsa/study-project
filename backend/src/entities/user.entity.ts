import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { LessonProgress } from './lesson-progress.entity';
import { Submission } from './submission.entity';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: 'text', default: UserRole.STUDENT })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Enrollment, e => e.user)
  enrollments: Enrollment[];

  @OneToMany(() => LessonProgress, lp => lp.user)
  lessonProgresses: LessonProgress[];

  @OneToMany(() => Submission, s => s.user)
  submissions: Submission[];
}
