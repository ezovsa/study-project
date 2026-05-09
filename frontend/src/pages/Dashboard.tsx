import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { theme as t } from '../styles/theme';

const StatCard = ({ title, value, icon, color, sub }: any) => (
  <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 24, border: `1px solid ${t.colors.border}`, flex: 1, minWidth: 160, position: 'relative', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = t.shadow.md; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '12px 12px 0 0' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: 12, color: t.colors.textSecondary, fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: t.colors.text, letterSpacing: '-1px' }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: t.colors.textMuted, marginTop: 4 }}>{sub}</div>}
      </div>
      <div style={{ width: 44, height: 44, borderRadius: t.radius.md, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{icon}</div>
    </div>
  </div>
);

const CourseCard = ({ course }: { course: any }) => {
  const diffColor: Record<string, string> = { beginner: t.colors.success, intermediate: t.colors.warning, advanced: t.colors.danger };
  const diffLabel: Record<string, string> = { beginner: 'Начальный', intermediate: 'Средний', advanced: 'Продвинутый' };
  return (
    <Link to={`/courses/${course.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 20, border: `1px solid ${t.colors.border}`, height: '100%', transition: 'all 0.2s', cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = t.colors.primary; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = t.shadow.glow; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = t.colors.border; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: t.colors.info, background: t.colors.infoLight, padding: '3px 8px', borderRadius: t.radius.full, fontWeight: 600 }}>{course.category?.name || 'Без категории'}</span>
          <span style={{ fontSize: 11, color: diffColor[course.difficulty], background: diffColor[course.difficulty] + '20', padding: '3px 8px', borderRadius: t.radius.full, fontWeight: 600 }}>{diffLabel[course.difficulty]}</span>
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: t.colors.text, marginBottom: 8, lineHeight: 1.4 }}>{course.title}</h3>
        <p style={{ fontSize: 13, color: t.colors.textSecondary, marginBottom: 16, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: t.colors.textMuted }}>
          <span>👤 {course.teacher?.firstName} {course.teacher?.lastName}</span>
          <span>📖 {course.lessonsCount || 0} уроков</span>
        </div>
      </div>
    </Link>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data.slice(0, 6)));
    if (user?.role === 'student') {
      api.get(`/users/${user.id}/stats`).then(r => setStats(r.data));
    } else if (user?.role === 'teacher') {
      api.get('/courses').then(r => {
        const mine = r.data.filter((c: any) => c.teacherId === user.id);
        setMyCourses(mine);
        setStats({ totalCourses: mine.length, publishedCourses: mine.filter((c: any) => c.isPublished).length });
      });
      api.get('/teacher/submissions/pending').then(r => setPendingCount(r.data?.length || 0)).catch(() => {});
    } else if (user?.role === 'admin') {
      api.get('/analytics/platform/overview').then(r => setStats(r.data));
    }
  }, [user]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: t.colors.text, letterSpacing: '-0.5px', marginBottom: 6 }}>
          {greeting}, {user?.firstName}! 👋
        </h1>
        <p style={{ color: t.colors.textSecondary, fontSize: 15 }}>
          {user?.role === 'student' && 'Продолжайте обучение — вы на верном пути'}
          {user?.role === 'teacher' && 'Управляйте курсами и отслеживайте прогресс студентов'}
          {user?.role === 'admin' && 'Обзор всей платформы'}
        </p>
      </div>

      {/* Student */}
      {user?.role === 'student' && stats && (
        <>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
            <StatCard title="Курсов записано" value={stats.totalCourses} icon="📚" color={t.colors.primary} />
            <StatCard title="Уроков пройдено" value={stats.completedLessons} icon="✅" color={t.colors.success} />
            <StatCard title="Средний балл" value={stats.avgScore || '—'} icon="⭐" color={t.colors.warning} sub="из 100 баллов" />
            <StatCard title="Часов обучения" value={stats.totalHours} icon="⏱" color={t.colors.purple} sub="всего" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: t.colors.text }}>Рекомендуемые курсы</h2>
            <Link to="/courses" style={{ color: t.colors.primary, fontSize: 14, fontWeight: 600 }}>Все курсы →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {courses.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        </>
      )}

      {/* Teacher */}
      {user?.role === 'teacher' && stats && (
        <>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
            <StatCard title="Моих курсов" value={stats.totalCourses} icon="📚" color={t.colors.primary} />
            <StatCard title="Опубликовано" value={stats.publishedCourses} icon="✅" color={t.colors.success} />
            <StatCard title="Ожидают проверки" value={pendingCount} icon="✏️" color={t.colors.warning} sub="заданий" />
          </div>

          {pendingCount > 0 && (
            <Link to="/teacher/submissions" style={{ display: 'block', marginBottom: 24 }}>
              <div style={{ background: `linear-gradient(135deg, ${t.colors.warning}20, ${t.colors.warning}10)`, border: `1px solid ${t.colors.warning}40`, borderRadius: t.radius.lg, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: t.radius.md, background: t.colors.warning + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>✏️</div>
                <div>
                  <div style={{ fontWeight: 700, color: t.colors.text, fontSize: 15 }}>Есть непроверенные задания</div>
                  <div style={{ color: t.colors.textSecondary, fontSize: 13 }}>{pendingCount} заданий ожидают вашей оценки</div>
                </div>
                <div style={{ marginLeft: 'auto', color: t.colors.warning, fontWeight: 700 }}>Проверить →</div>
              </div>
            </Link>
          )}

          <h2 style={{ fontSize: 18, fontWeight: 700, color: t.colors.text, marginBottom: 16 }}>Мои курсы</h2>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Link to="/teacher/courses/new" style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #6c63ff, #a855f7)', color: '#fff', borderRadius: t.radius.md, fontWeight: 700, fontSize: 13, boxShadow: t.shadow.glow }}>+ Создать курс</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {myCourses.map(c => (
              <div key={c.id} style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 20, border: `1px solid ${t.colors.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: t.colors.text, flex: 1, marginRight: 8 }}>{c.title}</h3>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: t.radius.full, fontWeight: 600, background: c.isPublished ? t.colors.successLight : t.colors.warningLight, color: c.isPublished ? t.colors.success : t.colors.warning, whiteSpace: 'nowrap' }}>
                    {c.isPublished ? '✅ Опубликован' : '📝 Черновик'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <Link to={`/courses/${c.id}`} style={{ flex: 1, padding: '8px', background: t.colors.primaryLight, color: t.colors.primary, borderRadius: t.radius.md, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>Открыть</Link>
                  <Link to={`/analytics/course/${c.id}`} style={{ flex: 1, padding: '8px', background: t.colors.successLight, color: t.colors.success, borderRadius: t.radius.md, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>Аналитика</Link>
                  <Link to={`/teacher/courses/${c.id}/edit`} style={{ flex: 1, padding: '8px', background: t.colors.warningLight, color: t.colors.warning, borderRadius: t.radius.md, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>Редактировать</Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Admin */}
      {user?.role === 'admin' && stats && (
        <>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
            <StatCard title="Пользователей" value={stats.totalUsers} icon="👥" color={t.colors.primary} />
            <StatCard title="Студентов" value={stats.totalStudents} icon="👨‍🎓" color={t.colors.info} />
            <StatCard title="Преподавателей" value={stats.totalTeachers} icon="👨‍🏫" color={t.colors.success} />
            <StatCard title="Курсов" value={stats.totalCourses} icon="📚" color={t.colors.warning} />
            <StatCard title="Записей" value={stats.totalEnrollments} icon="📝" color={t.colors.purple} />
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { to: '/admin/users', label: '👥 Пользователи', color: t.colors.primary },
              { to: '/admin/dashboard', label: '📊 Аналитика', color: t.colors.success },
              { to: '/reports', label: '📄 Отчёты', color: t.colors.purple },
              { to: '/courses', label: '📚 Все курсы', color: t.colors.info },
            ].map(btn => (
              <Link key={btn.to} to={btn.to} style={{ padding: '12px 24px', background: btn.color + '20', color: btn.color, borderRadius: t.radius.md, fontWeight: 700, fontSize: 14, border: `1px solid ${btn.color}30`, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = btn.color; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = btn.color + '20'; e.currentTarget.style.color = btn.color; }}>
                {btn.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
