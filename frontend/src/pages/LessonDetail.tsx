import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { theme as t } from '../styles/theme';

export default function LessonDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    api.get(`/lessons/${id}`).then(r => setLesson(r.data));
    startTime.current = Date.now();
    return () => {
      const spent = Math.round((Date.now() - startTime.current) / 1000);
      if (spent > 5) api.patch(`/lessons/${id}/progress`, { timeSpentSec: spent }).catch(() => {});
    };
  }, [id]);

  const handleComplete = async () => {
    setCompleting(true);
    await api.post(`/lessons/${id}/complete`);
    setCompleted(true); setCompleting(false);
  };

  if (!lesson) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="skeleton" style={{ height: 60 }} />
      <div className="skeleton" style={{ height: 400 }} />
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <Link to={`/courses/${lesson.courseId}`} style={{ color: t.colors.primary, fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          ← Назад к курсу
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Main content */}
        <div>
          <div style={{ background: t.colors.bgCard, borderRadius: t.radius.xl, padding: 32, border: `1px solid ${t.colors.border}`, marginBottom: 20 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: t.colors.text, marginBottom: 8, letterSpacing: '-0.3px' }}>{lesson.title}</h1>
            <div style={{ color: t.colors.textMuted, fontSize: 14, marginBottom: 28 }}>⏱ {lesson.durationMinutes} минут на изучение</div>

            {lesson.videoUrl && (
              <div style={{ marginBottom: 28, borderRadius: t.radius.lg, overflow: 'hidden', border: `1px solid ${t.colors.border}` }}>
                <video controls style={{ width: '100%', display: 'block' }} src={lesson.videoUrl} />
              </div>
            )}

            <div style={{ lineHeight: 1.9, color: t.colors.textSecondary, fontSize: 15, whiteSpace: 'pre-wrap' }}>{lesson.content}</div>
          </div>

          {/* Assignments */}
          {lesson.assignments?.length > 0 && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: t.colors.text, marginBottom: 14 }}>Задания к уроку</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lesson.assignments.map((a: any) => (
                  <Link key={a.id} to={`/assignments/${a.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: t.colors.bgCard, borderRadius: t.radius.md, padding: '16px 20px', border: `1px solid ${t.colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = t.colors.primary; e.currentTarget.style.boxShadow = t.shadow.glow; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = t.colors.border; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div>
                        <div style={{ fontWeight: 700, color: t.colors.text, fontSize: 15 }}>{a.title}</div>
                        <div style={{ fontSize: 13, color: t.colors.textMuted, marginTop: 3 }}>Макс. балл: {a.maxScore} • Попыток: {a.attemptsAllowed}</div>
                      </div>
                      <div style={{ color: t.colors.primary, fontWeight: 700, fontSize: 14 }}>Выполнить →</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 88 }}>
          {user?.role === 'student' && (
            <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 20, border: `1px solid ${t.colors.border}`, marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: t.colors.text, marginBottom: 16 }}>Прогресс урока</h3>
              {completed ? (
                <div style={{ background: t.colors.successLight, border: `1px solid ${t.colors.success}40`, borderRadius: t.radius.md, padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
                  <div style={{ color: t.colors.success, fontWeight: 700, fontSize: 15 }}>Урок пройден!</div>
                </div>
              ) : (
                <button onClick={handleComplete} disabled={completing}
                  style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #00d68f, #00b4d8)', color: '#fff', border: 'none', borderRadius: t.radius.md, cursor: 'pointer', fontWeight: 700, fontSize: 15, boxShadow: t.shadow.glowSuccess, transition: 'all 0.2s' }}>
                  {completing ? 'Сохранение...' : '✅ Отметить как пройденный'}
                </button>
              )}
            </div>
          )}

          <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 20, border: `1px solid ${t.colors.border}` }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: t.colors.text, marginBottom: 14 }}>О уроке</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '⏱', label: 'Длительность', value: `${lesson.durationMinutes} мин` },
                { icon: '📝', label: 'Заданий', value: lesson.assignments?.length || 0 },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: t.colors.textSecondary }}>{item.icon} {item.label}</span>
                  <span style={{ color: t.colors.text, fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
