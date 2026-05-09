import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../../entities/enrollment.entity';
import { LessonProgress } from '../../entities/lesson-progress.entity';
import { Submission } from '../../entities/submission.entity';
import { Lesson } from '../../entities/lesson.entity';
import { Course } from '../../entities/course.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Enrollment) private enrollRepo: Repository<Enrollment>,
    @InjectRepository(LessonProgress) private progressRepo: Repository<LessonProgress>,
    @InjectRepository(Submission) private subRepo: Repository<Submission>,
    @InjectRepository(Lesson) private lessonRepo: Repository<Lesson>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // --- STUDENT ---
  async studentOverview(studentId: number) {
    const enrollments = await this.enrollRepo.find({ where: { userId: studentId } });
    const progresses = await this.progressRepo.find({ where: { userId: studentId } });
    const submissions = await this.subRepo.find({ where: { userId: studentId } });
    const graded = submissions.filter(s => s.score !== null);
    const avgScore = graded.length ? graded.reduce((a, b) => a + b.score, 0) / graded.length : 0;
    const totalSec = progresses.reduce((a, b) => a + b.timeSpentSec, 0);
    return {
      totalCourses: enrollments.length,
      completedCourses: enrollments.filter(e => e.completedAt).length,
      completedLessons: progresses.filter(p => p.isCompleted).length,
      totalHours: Math.round(totalSec / 3600 * 10) / 10,
      avgScore: Math.round(avgScore * 10) / 10,
      totalSubmissions: submissions.length,
    };
  }

  async studentCourses(studentId: number) {
    const enrollments = await this.enrollRepo.find({ where: { userId: studentId }, relations: ['course'] });
    const result: any[] = [];
    for (const e of enrollments) {
      const lessons = await this.lessonRepo.find({ where: { courseId: e.courseId } });
      const progresses = await this.progressRepo.find({ where: { userId: studentId } });
      const completed = lessons.filter(l => progresses.find(p => p.lessonId === l.id && p.isCompleted)).length;
      result.push({
        course: e.course,
        enrolledAt: e.enrolledAt,
        completedAt: e.completedAt,
        totalLessons: lessons.length,
        completedLessons: completed,
        percent: lessons.length ? Math.round(completed / lessons.length * 100) : 0,
      });
    }
    return result;
  }

  async studentActivity(studentId: number) {
    const progresses = await this.progressRepo.find({ where: { userId: studentId } });
    const activityMap: Record<string, number> = {};
    for (const p of progresses) {
      const date = p.lastVisitedAt?.toISOString().split('T')[0];
      if (date) activityMap[date] = (activityMap[date] || 0) + p.timeSpentSec;
    }
    return Object.entries(activityMap).map(([date, seconds]) => ({ date, seconds })).sort((a, b) => a.date.localeCompare(b.date));
  }

  async studentWeakSpots(studentId: number) {
    const submissions = await this.subRepo.find({ where: { userId: studentId }, relations: ['assignment'] });
    const graded = submissions.filter(s => s.score !== null);
    const weak = graded.filter(s => s.score < s.assignment.maxScore * 0.6);
    return weak.map(s => ({
      assignmentId: s.assignmentId,
      assignmentTitle: s.assignment.title,
      score: s.score,
      maxScore: s.assignment.maxScore,
      percent: Math.round(s.score / s.assignment.maxScore * 100),
    }));
  }

  // --- TEACHER / COURSE ---
  async courseOverview(courseId: number) {
    const enrollments = await this.enrollRepo.find({ where: { courseId } });
    const lessons = await this.lessonRepo.find({ where: { courseId } });
    const allSubs: Submission[] = [];
    for (const l of lessons) {
      const subs = await this.subRepo.createQueryBuilder('s')
        .innerJoin('s.assignment', 'a')
        .where('a.lessonId = :lid', { lid: l.id })
        .andWhere('s.score IS NOT NULL')
        .getMany();
      allSubs.push(...subs);
    }
    const avgScore = allSubs.length ? allSubs.reduce((a, b) => a + b.score, 0) / allSubs.length : 0;
    const completedCount = enrollments.filter(e => e.completedAt).length;
    return {
      totalStudents: enrollments.length,
      completedStudents: completedCount,
      completionRate: enrollments.length ? Math.round(completedCount / enrollments.length * 100) : 0,
      avgScore: Math.round(avgScore * 10) / 10,
      totalLessons: lessons.length,
    };
  }

  async courseStudents(courseId: number) {
    const enrollments = await this.enrollRepo.find({ where: { courseId }, relations: ['user'] });
    const lessons = await this.lessonRepo.find({ where: { courseId } });
    const result: any[] = [];
    for (const e of enrollments) {
      const progresses = await this.progressRepo.find({ where: { userId: e.userId } });
      const completed = lessons.filter(l => progresses.find(p => p.lessonId === l.id && p.isCompleted)).length;
      const subs = await this.subRepo.find({ where: { userId: e.userId } });
      const graded = subs.filter(s => s.score !== null);
      const avg = graded.length ? graded.reduce((a, b) => a + b.score, 0) / graded.length : null;
      result.push({
        user: { id: e.user.id, firstName: e.user.firstName, lastName: e.user.lastName, email: e.user.email },
        enrolledAt: e.enrolledAt,
        completedLessons: completed,
        totalLessons: lessons.length,
        percent: lessons.length ? Math.round(completed / lessons.length * 100) : 0,
        avgScore: avg !== null ? Math.round(avg * 10) / 10 : null,
      });
    }
    return result;
  }

  async courseLessons(courseId: number) {
    const lessons = await this.lessonRepo.find({ where: { courseId } });
    const result: { lessonId: number; title: string; totalVisits: number; completedCount: number; avgTimeSec: number }[] = [];
    for (const l of lessons) {
      const progresses = await this.progressRepo.find({ where: { lessonId: l.id } });
      const completed = progresses.filter(p => p.isCompleted).length;
      const avgTime = progresses.length ? progresses.reduce((a, b) => a + b.timeSpentSec, 0) / progresses.length : 0;
      result.push({
        lessonId: l.id,
        title: l.title,
        totalVisits: progresses.length,
        completedCount: completed,
        avgTimeSec: Math.round(avgTime),
      });
    }
    return result;
  }

  async courseAssignments(courseId: number) {
    const lessons = await this.lessonRepo.find({ where: { courseId } });
    const result: { assignmentId: number; title: string; totalSubmissions: number; avgScore: number | null }[] = [];
    for (const l of lessons) {
      const subs = await this.subRepo.createQueryBuilder('s')
        .innerJoinAndSelect('s.assignment', 'a')
        .where('a.lessonId = :lid', { lid: l.id })
        .getMany();
      const grouped: Record<number, Submission[]> = {};
      for (const s of subs) {
        if (!grouped[s.assignmentId]) grouped[s.assignmentId] = [];
        grouped[s.assignmentId].push(s);
      }
      for (const [aId, aSubs] of Object.entries(grouped)) {
        const graded = aSubs.filter(s => s.score !== null);
        const avg = graded.length ? graded.reduce((a, b) => a + b.score, 0) / graded.length : null;
        result.push({
          assignmentId: Number(aId),
          title: aSubs[0].assignment.title,
          totalSubmissions: aSubs.length,
          avgScore: avg !== null ? Math.round(avg * 10) / 10 : null,
        });
      }
    }
    return result;
  }

  // --- ADMIN / PLATFORM ---
  async platformOverview() {
    const totalUsers = await this.userRepo.count();
    const totalStudents = await this.userRepo.count({ where: { role: 'student' as any } });
    const totalTeachers = await this.userRepo.count({ where: { role: 'teacher' as any } });
    const totalCourses = await this.courseRepo.count();
    const totalEnrollments = await this.enrollRepo.count();
    return { totalUsers, totalStudents, totalTeachers, totalCourses, totalEnrollments };
  }

  async platformTopCourses() {
    const courses = await this.courseRepo.find({ relations: ['teacher', 'category'] });
    const result: { course: Course; enrollmentsCount: number }[] = [];
    for (const c of courses) {
      const count = await this.enrollRepo.count({ where: { courseId: c.id } });
      result.push({ course: c, enrollmentsCount: count });
    }
    return result.sort((a, b) => b.enrollmentsCount - a.enrollmentsCount).slice(0, 10);
  }

  async platformCompletionRate() {
    const enrollments = await this.enrollRepo.find();
    const byMonth: Record<string, { total: number; completed: number }> = {};
    for (const e of enrollments) {
      const month = e.enrolledAt?.toISOString().slice(0, 7);
      if (!month) continue;
      if (!byMonth[month]) byMonth[month] = { total: 0, completed: 0 };
      byMonth[month].total++;
      if (e.completedAt) byMonth[month].completed++;
    }
    return Object.entries(byMonth).map(([month, data]) => ({
      month,
      total: data.total,
      completed: data.completed,
      rate: data.total ? Math.round(data.completed / data.total * 100) : 0,
    })).sort((a, b) => a.month.localeCompare(b.month));
  }
}
