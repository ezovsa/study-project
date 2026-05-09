import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Course } from './course.entity';
import { Assignment } from './assignment.entity';
import { LessonProgress } from './lesson-progress.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ default: 0 })
  orderIndex: number;

  @Column({ default: 0 })
  durationMinutes: number;

  @Column({ default: true })
  isPublished: boolean;

  @ManyToOne(() => Course, c => c.lessons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  courseId: number;

  @OneToMany(() => Assignment, a => a.lesson)
  assignments: Assignment[];

  @OneToMany(() => LessonProgress, lp => lp.lesson)
  progresses: LessonProgress[];

  @CreateDateColumn()
  createdAt: Date;
}
