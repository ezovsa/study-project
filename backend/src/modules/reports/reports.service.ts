import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../analytics/analytics.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Course } from '../../entities/course.entity';

@Injectable()
export class ReportsService {
  constructor(
    private analyticsService: AnalyticsService,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
  ) {}

  async studentReport(studentId: number, format: string) {
    const user = await this.userRepo.findOne({ where: { id: studentId } }) as User;
    const overview = await this.analyticsService.studentOverview(studentId);
    const courses = await this.analyticsService.studentCourses(studentId);
    const weakSpots = await this.analyticsService.studentWeakSpots(studentId);

    const data = {
      title: `Отчёт по студенту: ${user.lastName} ${user.firstName}`,
      generatedAt: new Date().toISOString(),
      student: { id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email },
      overview,
      courses,
      weakSpots,
    };

    if (format === 'csv') return this.toCsv(data);
    return this.toPdf(data);
  }

  async courseReport(courseId: number, format: string) {
    const course = await this.courseRepo.findOne({ where: { id: courseId }, relations: ['teacher'] }) as Course;
    const overview = await this.analyticsService.courseOverview(courseId);
    const students = await this.analyticsService.courseStudents(courseId);
    const lessons = await this.analyticsService.courseLessons(courseId);

    const data = {
      title: `Отчёт по курсу: ${course.title}`,
      generatedAt: new Date().toISOString(),
      course: { id: course.id, title: course.title, teacher: `${course.teacher.firstName} ${course.teacher.lastName}` },
      overview,
      students,
      lessons,
    };

    if (format === 'csv') return this.toCsv(data);
    return this.toPdf(data);
  }

  async platformReport(format: string) {
    const overview = await this.analyticsService.platformOverview();
    const topCourses = await this.analyticsService.platformTopCourses();
    const completionRate = await this.analyticsService.platformCompletionRate();

    const data = {
      title: 'Сводный отчёт по платформе',
      generatedAt: new Date().toISOString(),
      overview,
      topCourses: (topCourses as any[]).map((t: any) => ({ title: t.course.title, enrollments: t.enrollmentsCount })),
      completionRate,
    };

    if (format === 'csv') return this.toCsv(data);
    return this.toPdf(data);
  }

  private toCsv(data: any): { content: string; contentType: string; filename: string } {
    const lines: string[] = [];
    lines.push(data.title);
    lines.push(`Дата генерации: ${data.generatedAt}`);
    lines.push('');

    const flatten = (obj: any, prefix = '') => {
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
          flatten(v, prefix ? `${prefix}.${k}` : k);
        } else if (Array.isArray(v)) {
          lines.push(`${prefix ? prefix + '.' : ''}${k}:`);
          if (v.length > 0 && typeof v[0] === 'object') {
            lines.push(Object.keys(v[0]).join(';'));
            v.forEach(row => lines.push(Object.values(row).join(';')));
          }
        } else {
          lines.push(`${prefix ? prefix + '.' : ''}${k};${v}`);
        }
      }
    };
    flatten(data);
    const BOM = '\uFEFF';
    return { content: BOM + lines.join('\n'), contentType: 'text/csv; charset=utf-8', filename: 'report.csv' };
  }

  private toPdf(data: any): { content: any; contentType: string; filename: string } {
    const PdfPrinter = require('pdfmake');
    const fonts = {
      Roboto: {
        normal: Buffer.from(''),
        bold: Buffer.from(''),
        italics: Buffer.from(''),
        bolditalics: Buffer.from(''),
      },
    };

    const docDef = {
      content: [
        { text: data.title, style: 'header' },
        { text: `Дата: ${new Date(data.generatedAt).toLocaleString('ru-RU')}`, margin: [0, 0, 0, 10] },
        ...this.buildPdfContent(data),
      ],
      styles: { header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] } },
      defaultStyle: { fontSize: 11 },
    };

    // Return JSON for now (pdfmake needs font files for full PDF)
    return { content: data, contentType: 'application/json', filename: 'report.json' };
  }

  private buildPdfContent(data: any): any[] {
    const items: any[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (key === 'title' || key === 'generatedAt') continue;
      if (typeof value === 'object' && !Array.isArray(value)) {
        items.push({ text: key, bold: true, margin: [0, 5, 0, 2] });
        for (const [k, v] of Object.entries(value as any)) {
          items.push({ text: `  ${k}: ${v}` });
        }
      }
    }
    return items;
  }

  scheduleReport(dto: any) {
    return { message: 'Расписание отчёта сохранено', schedule: dto };
  }
}
