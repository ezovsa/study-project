import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { theme as t } from '../styles/theme';

const diffLabel: Record<string, string> = { beginner: 'Начальный', intermediate: 'Средний', advanced: 'Продвинутый' };
const diffColor: Record<string, string> = { beginner: t.colors.success, intermediate: t.colors.warning, advanced: t.colors.danger };

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    api.get(`/courses/${id}`).then(r => setCourse(r.data));
    if (user?.role === 'student') {
      api.get(`/courses/${id}/progress`).then(r => { setProgress(r.data); setEnrolled(true); }).catch(() => {});
    }
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    await api.post(`/courses/${id}/enroll`);
    const r = await api.get(`/courses/${id}/progress`);
    setProgress(r.data); setEnrolled(true); setEnrolling(false);
  };

  const handlePublish = async () => {
    await api.post(`/courses/${id}/publish`);
    setCourse({ ...course, isPublished: true });
  };

  if (!course) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="skeleton" style={{ height: 200 }} />
      <div className="skeleton" style={{ height: 400 }} />
    </div>
  );

  const lessons = course.lessons?.sort((a: any, b: any) => a.orderIndex - b.orderIndex) || [];
  const completedIds = new Set(progress?.lessons?.filter((l: any) => l.progress?.isCompleted).map((l: any) => l.id));

  return (
    <div className="fade-in">
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${t.colors.bgCard} 0%, ${t.colors.bgSecondary} 100%)`, borderRadius: t.radius.xl, padding: 32, marginBottom: 24, border: `1px solid ${t.colors.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: `radial-gradient(circle, ${t.colors.primary}15, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: t.colors.info, background: t.colors.infoLight, padding: '4px 12px', borderRadius: t.radius.full, fontWeight: 600 }}>{course.category?.name}</span>
              <span style={{ fontSize: 12, color: diffColor[course.difficulty], background: diffColor[course.difficulty] + '20', padding: '4px 12px', borderRadius: t.radius.full, fontWeight: 600 }}>{diffLabel[course.difficulty]}</span>
              {course.isPublished
                ? <span style={{ fontSize: 12, color: t.colors.success, background: t.colors.successLight, padding: '4px 12px', borderRadius: t.radius.full, fontWeight: 600 }}>✅ Опубликован</span>
                : <span style={{ fontSize: 12, color: t.colors.warning, background: t.colors.warningLight, padding: '4px 12px', borderRadius: t.radius.full, fontWeight: 600 }}>📝 Черновик</span>}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: t.colors.text, marginBottom: 12, letterSpacing: '-0.5px', lineHeight: 1.3 }}>{course.title}</h1>
            <p style={{ color: t.colors.textSecondary, lineHeight: 1.7, marginBottom: 20, fontSize: 15 }}>{course.description}</p>
            <div style={{ display: 'flex', gap: 20, fontSize: 14, color: t.colors.textSecondary, flexWrap: 'wrap' }}>
              <span>👤 {course.teacher?.firstName} {course.teacher?.lastName}</span>
              <span>📖 {lessons.length} уроков</span>
            </div>
          </div>

          {/* Action panel */}
          <div style={{ width: 260, flexShrink: 0 }}>
            {user?.role === 'student' && !enrolled && (
              <button onClick={handleEnroll} disabled={enrolling}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #6c63ff, #a855f7)', color: '#fff', border: 'none', borderRadius: t.radius.md, cursor: 'pointer', fontWeight: 700, fontSize: 16, boxShadow: t.shadow.glow, transition: 'all 0.2s' }}>
                {enrolling ? 'Запись...' : '🚀 Записаться на курс'}
              </button>
            )}
            {user?.role === 'student' && enrolled && progress && (
              <div style={{ background: t.colors.bgSecondary, borderRadius: t.radius.lg, padding: 20, border: `1px solid ${t.colors.border}` }}>
                <div style={{ color: t.colors.success, fontWeight: 700, marginBottom: 12, fontSize: 15 }}>✅ Вы записаны</div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: t.colors.textSecondary, marginBottom: 6 }}>
                    <span>Прогресс</span>
                    <span style={{ color: t.colors.success, fontWeight: 700 }}>{progress.percent}%</span>
                  </div>
                  <div style={{ background: t.colors.border, borderRadius: t.radius.full, height: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress.percent}%`, background: `linear-gradient(90deg, ${t.colors.success}, ${t.colors.primary})`, borderRadius: t.radius.full, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
                <div style={{ fontSize: 13, color: t.colors.textSecondary }}>{progress.completedLessons} из {progress.totalLessons} уроков</div>
              </div>
            )}
            {user?.role === 'teacher' && course.teacherId === user.id && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {!course.isPublished && (
                  <button onClick={handlePublish} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #6c63ff, #a855f7)', color: '#fff', border: 'none', borderRadius: t.radius.md, cursor: 'pointer', fontWeight: 700, boxShadow: t.shadow.glow }}>
                    🚀 Опубликовать курс
                  </button>
                )}
                <Link to={`/analytics/course/${id}`} style={{ display: 'block', width: '100%', padding: '12px', background: t.colors.successLight, color: t.colors.success, borderRadius: t.radius.md, textAlign: 'center', fontWeight: 700, border: `1px solid ${t.colors.success}30` }}>
                  📊 Аналитика курса
                </Link>
                <Link to="/teacher/submissions" style={{ display: 'block', width: '100%', padding: '12px', background: t.colors.warningLight, color: t.colors.warning, borderRadius: t.radius.md, textAlign: 'center', fontWeight: 700, border: `1px solid ${t.colors.warning}30` }}>
                  ✏️ Проверить задания
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lessons */}
      <h2 style={{ fontSize: 20, fontWeight: 700, color: t.colors.text, marginBottom: 16 }}>Программа курса</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lessons.map((lesson: any, i: number) => {
          const isCompleted = completedIds.has(lesson.id);
          return (
            <Link key={lesson.id} to={`/lessons/${lesson.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: t.colors.bgCard, borderRadius: t.radius.md, padding: '16px 20px', border: `1px solid ${isCompleted ? t.colors.success + '40' : t.colors.border}`, display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = t.colors.primary; e.currentTarget.style.background = t.colors.bgCardHover; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = isCompleted ? t.colors.success + '40' : t.colors.border; e.currentTarget.style.background = t.colors.bgCard; }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: isCompleted ? t.colors.successLight : t.colors.bgSecondary, border: `2px solid ${isCompleted ? t.colors.success : t.colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isCompleted ? t.colors.success : t.colors.textMuted, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {isCompleted ? '✓' : i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: t.colors.text, fontSize: 15 }}>{lesson.title}</div>
                  <div style={{ fontSize: 13, color: t.colors.textMuted, marginTop: 2 }}>⏱ {lesson.durationMinutes} мин</div>
                </div>
                <div style={{ color: t.colors.textMuted, fontSize: 20 }}>›</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
