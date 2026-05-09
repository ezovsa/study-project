import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Course, StudentStats, TeacherStats, AdminStats } from '../types';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import TeacherDashboard from '../components/dashboard/TeacherDashboard';
import AdminDashboardWidget from '../components/dashboard/AdminDashboard';
import styles from './Dashboard.module.css';

const SUBTITLE: Record<string, string> = {
  student: 'Продолжайте обучение — вы на верном пути',
  teacher: 'Управляйте курсами и отслеживайте прогресс студентов',
  admin: 'Обзор всей платформы',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [teacherStats, setTeacherStats] = useState<TeacherStats | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    if (user.role === 'student') {
      api.get<Course[]>('/courses').then(r => setCourses(r.data.slice(0, 6))).catch(() => {});
      api.get<StudentStats>(`/users/${user.id}/stats`).then(r => setStudentStats(r.data)).catch(() => {});
    } else if (user.role === 'teacher') {
      api.get<Course[]>('/courses').then(r => {
        const mine = r.data.filter(c => c.teacherId === user.id);
        setMyCourses(mine);
        setTeacherStats({ totalCourses: mine.length, publishedCourses: mine.filter(c => c.isPublished).length });
      }).catch(() => {});
      api.get('/teacher/submissions/pending').then(r => setPendingCount(r.data?.length || 0)).catch(() => {});
    } else if (user.role === 'admin') {
      api.get<AdminStats>('/analytics/platform/overview').then(r => setAdminStats(r.data)).catch(() => {});
    }
  }, [user]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <h1 className={styles.greeting}>{greeting}, {user?.firstName}! 👋</h1>
        <p className={styles.subtitle}>{SUBTITLE[user?.role ?? 'student']}</p>
      </div>

      {user?.role === 'student' && studentStats && (
        <StudentDashboard stats={studentStats} courses={courses} />
      )}
      {user?.role === 'teacher' && teacherStats && (
        <TeacherDashboard stats={teacherStats} courses={myCourses} pendingCount={pendingCount} />
      )}
      {user?.role === 'admin' && adminStats && (
        <AdminDashboardWidget stats={adminStats} />
      )}
    </div>
  );
}
