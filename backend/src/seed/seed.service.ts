import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Course, Difficulty } from '../entities/course.entity';
import { Lesson } from '../entities/lesson.entity';
import { Assignment, AssignmentType } from '../entities/assignment.entity';
import { Enrollment } from '../entities/enrollment.entity';
import { LessonProgress } from '../entities/lesson-progress.entity';
import { Submission, SubmissionStatus } from '../entities/submission.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(Lesson) private lessonRepo: Repository<Lesson>,
    @InjectRepository(Assignment) private assignRepo: Repository<Assignment>,
    @InjectRepository(Enrollment) private enrollRepo: Repository<Enrollment>,
    @InjectRepository(LessonProgress) private progressRepo: Repository<LessonProgress>,
    @InjectRepository(Submission) private subRepo: Repository<Submission>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.userRepo.count();
    if (count > 0) return;
    await this.seed();
  }

  async seed() {
    const hash = await bcrypt.hash('password123', 10);

    // Категории
    const cats = await this.categoryRepo.save([
      { name: 'Программирование', slug: 'programming' },
      { name: 'Математика', slug: 'math' },
      { name: 'Дизайн', slug: 'design' },
      { name: 'Иностранные языки', slug: 'languages' },
    ]);

    // Преподаватели
    const teachers = await this.userRepo.save([
      { email: 'ivanov@edu.ru', passwordHash: hash, firstName: 'Александр', lastName: 'Иванов', role: UserRole.TEACHER },
      { email: 'petrova@edu.ru', passwordHash: hash, firstName: 'Мария', lastName: 'Петрова', role: UserRole.TEACHER },
      { email: 'sidorov@edu.ru', passwordHash: hash, firstName: 'Дмитрий', lastName: 'Сидоров', role: UserRole.TEACHER },
    ]);

    // Студенты
    const students = await this.userRepo.save([
      { email: 'student1@edu.ru', passwordHash: hash, firstName: 'Анна', lastName: 'Смирнова', role: UserRole.STUDENT },
      { email: 'student2@edu.ru', passwordHash: hash, firstName: 'Иван', lastName: 'Козлов', role: UserRole.STUDENT },
      { email: 'student3@edu.ru', passwordHash: hash, firstName: 'Екатерина', lastName: 'Новикова', role: UserRole.STUDENT },
      { email: 'student4@edu.ru', passwordHash: hash, firstName: 'Михаил', lastName: 'Морозов', role: UserRole.STUDENT },
      { email: 'student5@edu.ru', passwordHash: hash, firstName: 'Ольга', lastName: 'Волкова', role: UserRole.STUDENT },
    ]);

    // Администратор
    await this.userRepo.save({
      email: 'admin@edu.ru', passwordHash: hash, firstName: 'Администратор', lastName: 'Системы', role: UserRole.ADMIN,
    });

    // Курсы
    const courses = await this.courseRepo.save([
      {
        title: 'Основы Python для начинающих',
        description: 'Полный курс по Python с нуля. Вы изучите синтаксис языка, структуры данных, функции и основы ООП.',
        difficulty: Difficulty.BEGINNER, isPublished: true,
        teacherId: teachers[0].id, categoryId: cats[0].id,
      },
      {
        title: 'Веб-разработка на JavaScript',
        description: 'Современный JavaScript: ES6+, асинхронность, работа с DOM, fetch API и основы React.',
        difficulty: Difficulty.INTERMEDIATE, isPublished: true,
        teacherId: teachers[0].id, categoryId: cats[0].id,
      },
      {
        title: 'Линейная алгебра и аналитическая геометрия',
        description: 'Векторы, матрицы, определители, системы линейных уравнений и их приложения.',
        difficulty: Difficulty.INTERMEDIATE, isPublished: true,
        teacherId: teachers[1].id, categoryId: cats[1].id,
      },
      {
        title: 'UI/UX дизайн: от идеи до прототипа',
        description: 'Принципы пользовательского интерфейса, работа в Figma, создание прототипов и тестирование.',
        difficulty: Difficulty.BEGINNER, isPublished: true,
        teacherId: teachers[2].id, categoryId: cats[2].id,
      },
      {
        title: 'Английский язык для IT-специалистов',
        description: 'Техническая лексика, чтение документации, написание писем и общение на английском в IT-среде.',
        difficulty: Difficulty.BEGINNER, isPublished: true,
        teacherId: teachers[1].id, categoryId: cats[3].id,
      },
    ]);

    // Уроки для курса Python
    const pythonLessons = await this.lessonRepo.save([
      { courseId: courses[0].id, title: 'Введение в Python. Установка и настройка', content: 'Python — интерпретируемый язык программирования высокого уровня. В этом уроке мы установим Python и настроим среду разработки VS Code.', orderIndex: 1, durationMinutes: 30 },
      { courseId: courses[0].id, title: 'Переменные и типы данных', content: 'Изучаем основные типы данных: int, float, str, bool. Операции с переменными и приведение типов.', orderIndex: 2, durationMinutes: 45 },
      { courseId: courses[0].id, title: 'Условные операторы и циклы', content: 'Конструкции if/elif/else, циклы for и while, операторы break и continue.', orderIndex: 3, durationMinutes: 60 },
      { courseId: courses[0].id, title: 'Функции и модули', content: 'Определение функций, аргументы, возвращаемые значения, лямбда-функции, импорт модулей.', orderIndex: 4, durationMinutes: 60 },
      { courseId: courses[0].id, title: 'Списки, кортежи и словари', content: 'Работа с коллекциями данных: создание, индексация, методы, генераторы списков.', orderIndex: 5, durationMinutes: 75 },
    ]);

    // Уроки для курса JavaScript
    const jsLessons = await this.lessonRepo.save([
      { courseId: courses[1].id, title: 'Основы JavaScript и ES6+', content: 'let/const, стрелочные функции, деструктуризация, spread/rest операторы.', orderIndex: 1, durationMinutes: 45 },
      { courseId: courses[1].id, title: 'Асинхронный JavaScript', content: 'Callbacks, Promises, async/await. Работа с асинхронным кодом.', orderIndex: 2, durationMinutes: 60 },
      { courseId: courses[1].id, title: 'Работа с DOM', content: 'Выборка элементов, изменение содержимого, обработка событий, создание элементов.', orderIndex: 3, durationMinutes: 60 },
      { courseId: courses[1].id, title: 'Fetch API и работа с сервером', content: 'HTTP-запросы, работа с JSON, обработка ошибок, CORS.', orderIndex: 4, durationMinutes: 45 },
    ]);

    // Уроки для курса Математика
    const mathLessons = await this.lessonRepo.save([
      { courseId: courses[2].id, title: 'Векторы и операции над ними', content: 'Понятие вектора, сложение, вычитание, скалярное произведение, длина вектора.', orderIndex: 1, durationMinutes: 60 },
      { courseId: courses[2].id, title: 'Матрицы и определители', content: 'Виды матриц, операции над матрицами, вычисление определителей.', orderIndex: 2, durationMinutes: 75 },
      { courseId: courses[2].id, title: 'Системы линейных уравнений', content: 'Метод Гаусса, метод Крамера, матричный метод решения СЛАУ.', orderIndex: 3, durationMinutes: 90 },
    ]);

    // Задания для Python
    const pythonAssignments = await this.assignRepo.save([
      { lessonId: pythonLessons[1].id, title: 'Практика: типы данных', description: 'Напишите программу, которая принимает строку от пользователя и выводит её длину, тип и первый символ.', type: AssignmentType.TEXT, maxScore: 100, attemptsAllowed: 3 },
      { lessonId: pythonLessons[2].id, title: 'Практика: циклы', description: 'Напишите программу для вывода таблицы умножения от 1 до 10 с использованием вложенных циклов.', type: AssignmentType.TEXT, maxScore: 100, attemptsAllowed: 3 },
      { lessonId: pythonLessons[3].id, title: 'Практика: функции', description: 'Реализуйте функцию fibonacci(n), возвращающую n-е число Фибоначчи. Используйте рекурсию и итеративный подход.', type: AssignmentType.TEXT, maxScore: 100, attemptsAllowed: 2 },
      { lessonId: pythonLessons[4].id, title: 'Практика: коллекции', description: 'Дан список чисел. Найдите среднее, максимум, минимум и отсортируйте список без использования встроенных функций sort/max/min.', type: AssignmentType.TEXT, maxScore: 100, attemptsAllowed: 3 },
    ]);

    // Задания для JavaScript
    const jsAssignments = await this.assignRepo.save([
      { lessonId: jsLessons[0].id, title: 'ES6+ синтаксис', description: 'Перепишите функцию на стрелочную, используйте деструктуризацию для извлечения данных из объекта.', type: AssignmentType.TEXT, maxScore: 100, attemptsAllowed: 3 },
      { lessonId: jsLessons[1].id, title: 'Промисы и async/await', description: 'Создайте функцию, которая имитирует загрузку данных с задержкой 1 секунду и возвращает результат через Promise.', type: AssignmentType.TEXT, maxScore: 100, attemptsAllowed: 2 },
    ]);

    // Задания для математики
    const mathAssignments = await this.assignRepo.save([
      { lessonId: mathLessons[0].id, title: 'Задачи на векторы', description: 'Найдите скалярное произведение векторов a=(3,4,0) и b=(1,-2,5). Вычислите угол между ними.', type: AssignmentType.TEXT, maxScore: 100, attemptsAllowed: 3 },
      { lessonId: mathLessons[1].id, title: 'Вычисление определителей', description: 'Вычислите определитель матрицы 3x3 методом разложения по первой строке.', type: AssignmentType.TEXT, maxScore: 100, attemptsAllowed: 3 },
    ]);

    // Записи студентов на курсы
    const enrollmentData = [
      { userId: students[0].id, courseId: courses[0].id },
      { userId: students[0].id, courseId: courses[1].id },
      { userId: students[0].id, courseId: courses[3].id },
      { userId: students[1].id, courseId: courses[0].id },
      { userId: students[1].id, courseId: courses[2].id },
      { userId: students[2].id, courseId: courses[1].id },
      { userId: students[2].id, courseId: courses[4].id },
      { userId: students[3].id, courseId: courses[0].id },
      { userId: students[3].id, courseId: courses[2].id },
      { userId: students[3].id, courseId: courses[3].id },
      { userId: students[4].id, courseId: courses[4].id },
      { userId: students[4].id, courseId: courses[1].id },
    ];

    const now = new Date();
    const enrollments = await this.enrollRepo.save(
      enrollmentData.map(e => ({
        ...e,
        enrolledAt: new Date(now.getTime() - Math.random() * 60 * 24 * 3600 * 1000),
      }))
    );

    // Прогресс по урокам
    const progressData = [
      // Анна - Python (все уроки)
      { userId: students[0].id, lessonId: pythonLessons[0].id, isCompleted: true, timeSpentSec: 1800, visitCount: 2 },
      { userId: students[0].id, lessonId: pythonLessons[1].id, isCompleted: true, timeSpentSec: 2700, visitCount: 3 },
      { userId: students[0].id, lessonId: pythonLessons[2].id, isCompleted: true, timeSpentSec: 3600, visitCount: 2 },
      { userId: students[0].id, lessonId: pythonLessons[3].id, isCompleted: false, timeSpentSec: 1200, visitCount: 1 },
      // Анна - JS
      { userId: students[0].id, lessonId: jsLessons[0].id, isCompleted: true, timeSpentSec: 2700, visitCount: 2 },
      { userId: students[0].id, lessonId: jsLessons[1].id, isCompleted: false, timeSpentSec: 900, visitCount: 1 },
      // Иван - Python
      { userId: students[1].id, lessonId: pythonLessons[0].id, isCompleted: true, timeSpentSec: 2100, visitCount: 3 },
      { userId: students[1].id, lessonId: pythonLessons[1].id, isCompleted: true, timeSpentSec: 3000, visitCount: 2 },
      { userId: students[1].id, lessonId: pythonLessons[2].id, isCompleted: true, timeSpentSec: 4200, visitCount: 4 },
      { userId: students[1].id, lessonId: pythonLessons[3].id, isCompleted: true, timeSpentSec: 3600, visitCount: 2 },
      { userId: students[1].id, lessonId: pythonLessons[4].id, isCompleted: true, timeSpentSec: 4500, visitCount: 3 },
      // Иван - Математика
      { userId: students[1].id, lessonId: mathLessons[0].id, isCompleted: true, timeSpentSec: 3600, visitCount: 2 },
      { userId: students[1].id, lessonId: mathLessons[1].id, isCompleted: false, timeSpentSec: 1800, visitCount: 1 },
      // Екатерина - JS
      { userId: students[2].id, lessonId: jsLessons[0].id, isCompleted: true, timeSpentSec: 2700, visitCount: 2 },
      { userId: students[2].id, lessonId: jsLessons[1].id, isCompleted: true, timeSpentSec: 3600, visitCount: 3 },
      { userId: students[2].id, lessonId: jsLessons[2].id, isCompleted: true, timeSpentSec: 3600, visitCount: 2 },
      { userId: students[2].id, lessonId: jsLessons[3].id, isCompleted: false, timeSpentSec: 1200, visitCount: 1 },
      // Михаил - Python
      { userId: students[3].id, lessonId: pythonLessons[0].id, isCompleted: true, timeSpentSec: 1800, visitCount: 1 },
      { userId: students[3].id, lessonId: pythonLessons[1].id, isCompleted: false, timeSpentSec: 600, visitCount: 1 },
      // Ольга - JS
      { userId: students[4].id, lessonId: jsLessons[0].id, isCompleted: true, timeSpentSec: 2700, visitCount: 2 },
      { userId: students[4].id, lessonId: jsLessons[1].id, isCompleted: true, timeSpentSec: 3600, visitCount: 2 },
    ];

    const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 3600 * 1000);
    const savedProgresses = await this.progressRepo.save(
      progressData.map((p, i) => ({ ...p, lastVisitedAt: daysAgo(Math.floor(Math.random() * 30)) }))
    );

    // Ответы на задания
    const submissionData = [
      // Анна - Python
      { userId: students[0].id, assignmentId: pythonAssignments[0].id, answerText: 'text = input()\nprint(len(text), type(text), text[0])', score: 95, feedback: 'Отлично! Всё верно.', status: SubmissionStatus.GRADED, attemptNumber: 1 },
      { userId: students[0].id, assignmentId: pythonAssignments[1].id, answerText: 'for i in range(1,11):\n  for j in range(1,11):\n    print(i*j, end=" ")\n  print()', score: 100, feedback: 'Превосходно!', status: SubmissionStatus.GRADED, attemptNumber: 1 },
      { userId: students[0].id, assignmentId: pythonAssignments[2].id, answerText: 'def fibonacci(n):\n  if n <= 1: return n\n  return fibonacci(n-1) + fibonacci(n-2)', score: 85, feedback: 'Рекурсия верна, но итеративный вариант не реализован.', status: SubmissionStatus.GRADED, attemptNumber: 1 },
      // Анна - JS
      { userId: students[0].id, assignmentId: jsAssignments[0].id, answerText: 'const fn = ({name, age}) => `${name} is ${age}`', score: 90, feedback: 'Хорошо!', status: SubmissionStatus.GRADED, attemptNumber: 1 },
      // Иван - Python
      { userId: students[1].id, assignmentId: pythonAssignments[0].id, answerText: 's = input()\nprint(len(s), type(s).__name__, s[0])', score: 100, feedback: 'Отлично!', status: SubmissionStatus.GRADED, attemptNumber: 1 },
      { userId: students[1].id, assignmentId: pythonAssignments[1].id, answerText: 'for i in range(1,11):\n  print(*[i*j for j in range(1,11)])', score: 100, feedback: 'Элегантное решение!', status: SubmissionStatus.GRADED, attemptNumber: 1 },
      { userId: students[1].id, assignmentId: pythonAssignments[2].id, answerText: 'def fibonacci(n):\n  a,b=0,1\n  for _ in range(n): a,b=b,a+b\n  return a', score: 100, feedback: 'Отличный итеративный подход!', status: SubmissionStatus.GRADED, attemptNumber: 1 },
      { userId: students[1].id, assignmentId: pythonAssignments[3].id, answerText: 'nums=[3,1,4,1,5,9]\navg=sum(nums)/len(nums)', score: 75, feedback: 'Использованы встроенные функции, нужно реализовать вручную.', status: SubmissionStatus.GRADED, attemptNumber: 1 },
      // Иван - Математика
      { userId: students[1].id, assignmentId: mathAssignments[0].id, answerText: 'a·b = 3*1 + 4*(-2) + 0*5 = 3-8+0 = -5\n|a|=5, |b|=√30\ncos(θ) = -5/(5√30)', score: 90, feedback: 'Верно!', status: SubmissionStatus.GRADED, attemptNumber: 1 },
      // Екатерина - JS
      { userId: students[2].id, assignmentId: jsAssignments[0].id, answerText: 'const greet = ({name}) => `Привет, ${name}!`', score: 95, feedback: 'Отлично!', status: SubmissionStatus.GRADED, attemptNumber: 1 },
      { userId: students[2].id, assignmentId: jsAssignments[1].id, answerText: 'const load = () => new Promise(res => setTimeout(() => res("data"), 1000))', score: 100, feedback: 'Превосходно!', status: SubmissionStatus.GRADED, attemptNumber: 1 },
      // Михаил - Python (слабые результаты)
      { userId: students[3].id, assignmentId: pythonAssignments[0].id, answerText: 'print(input())', score: 40, feedback: 'Не выведены длина и тип. Нужно доработать.', status: SubmissionStatus.GRADED, attemptNumber: 1 },
      // Ольга - JS
      { userId: students[4].id, assignmentId: jsAssignments[0].id, answerText: 'const f = (obj) => obj.name', score: 70, feedback: 'Частично верно, деструктуризация не использована.', status: SubmissionStatus.GRADED, attemptNumber: 1 },
      { userId: students[4].id, assignmentId: jsAssignments[1].id, answerText: 'async function load() { await new Promise(r => setTimeout(r, 1000)); return "data"; }', score: 95, feedback: 'Отлично!', status: SubmissionStatus.GRADED, attemptNumber: 1 },
    ];

    await this.subRepo.save(
      submissionData.map(s => ({ ...s, submittedAt: daysAgo(Math.floor(Math.random() * 25)), gradedAt: daysAgo(Math.floor(Math.random() * 20)) }))
    );

    // Завершённые курсы
    await this.enrollRepo.update(
      { userId: students[1].id, courseId: courses[0].id },
      { completedAt: daysAgo(5), status: 'completed' }
    );

    console.log('✅ База данных заполнена тестовыми данными на русском языке');
  }
}
