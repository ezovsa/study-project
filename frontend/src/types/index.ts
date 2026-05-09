export type UserRole = 'student' | 'teacher' | 'admin';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type SubmissionStatus = 'pending' | 'graded';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface Category {
  id: number;
  name: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  isPublished: boolean;
  teacherId: number;
  teacher?: { firstName: string; lastName: string };
  category?: Category;
  lessonsCount?: number;
}

export interface StudentStats {
  totalCourses: number;
  completedLessons: number;
  avgScore: number | null;
  totalHours: number;
}

export interface TeacherStats {
  totalCourses: number;
  publishedCourses: number;
}

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalEnrollments: number;
}

export interface AssignmentLesson {
  id: number;
  title: string;
  course?: { id: number; title: string };
}

export interface Assignment {
  id: number;
  title: string;
  maxScore: number;
  lesson?: AssignmentLesson;
}

export interface Submission {
  id: number;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  answerText?: string;
  submittedAt: string;
  attemptNumber: number;
  user?: { firstName: string; lastName: string };
  assignment?: Assignment;
}
