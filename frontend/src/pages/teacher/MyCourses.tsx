import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { theme as t } from '../../styles/theme';

export default function MyCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/courses', { params: { teacherId: user?.id } })
      .then(r => { setCourses(r.data); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Удалить курс «${title}»? Это действие необратимо.`)) return;
    await api.delete(`/courses/${id}`);
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const handlePublish = async (id: number) => {
    await api.post(`/courses/${id}/publish`);
    setCourses(prev => prev.map(c => c.id === id ? { ...c, isPublished: true } : c));
  };

  const handleUnpublish = async (id: number) => {
    await api.patch(`/courses/${id}`, { isPublished: false });
    setCourses(prev => prev.map(c => c.id === id ? { ...c, isPublished: false } : c));
  };

  const diffLabel: Record<string, string> = { beginner: 'Начальный', intermediate: 'Средний', advanced: 'Продвинутый' };
  const diffColor: Record<string, string> = { beginner: t.colors.success, intermediate: t.colors.warning, advanced: t.colors.danger };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: t.colors.text, letterSpacing: '-0.5px', marginBottom: 6 }}>Мои курсы</h1>
          <p style={{ color: t.colors.textSecondary, fontSize: 14 }}>Создавайте и управляйте учебными курсами</p>
        </div>
        <button onClick={() => navigate('/teacher/courses/new')}
          style={{ padding: '11px 22px', background: 'linear-gradient(135deg, #6c63ff, #a855f7)', color: '#fff', border: 'none', borderRadius: t.radius.md, cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: t.shadow.glow, display: 'flex', alignItems: 'center', gap: 8 }}>
          + Создать курс
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Всего курсов', value: courses.length, color: t.colors.primary },
          { label: 'Опубликовано', value: courses.filter(c => c.isPublished).length, color: t.colors.success },
          { label: 'Черновиков', value: courses.filter(c => !c.isPublished).length, color: t.colors.warning },
          { label: 'Студентов', value: courses.reduce((a, c) => a + (c.enrollmentsCount || 0), 0), color: t.colors.info },
        ].map(s => (
          <div key={s.label} style={{ background: t.colors.bgCard, borderRadius: t.radius.md, padding: '12px 20px', border: `1px solid ${t.colors.border}`, display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 13, color: t.colors.textSecondary }}>{s.label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
        </div>
      ) : courses.length === 0 ? (
        <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 60, textAlign: 'center', border: `1px solid ${t.colors.border}` }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.colors.text, marginBottom: 8 }}>Курсов пока нет</div>
          <div style={{ color: t.colors.textSecondary, marginBottom: 24 }}>Создайте первый курс и начните обучать студентов</div>
          <button onClick={() => navigate('/teacher/courses/new')}
            style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #6c63ff, #a855f7)', color: '#fff', border: 'none', borderRadius: t.radius.md, cursor: 'pointer', fontWeight: 700, fontSize: 15, boxShadow: t.shadow.glow }}>
            + Создать первый курс
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {courses.map(c => (
            <div key={c.id} style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, border: `1px solid ${t.colors.border}`, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = t.colors.borderLight)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = t.colors.border)}>

              {/* Status indicator */}
              <div style={{ width: 4, height: 60, borderRadius: 2, background: c.isPublished ? t.colors.success : t.colors.warning, flexShrink: 0 }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: t.colors.text, margin: 0 }}>{c.title}</h3>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: t.radius.full, fontWeight: 600, background: c.isPublished ? t.colors.successLight : t.colors.warningLight, color: c.isPublished ? t.colors.success : t.colors.warning }}>
                    {c.isPublished ? '✅ Опубликован' : '📝 Черновик'}
                  </span>
                  <span style={{ fontSize: 11, color: diffColor[c.difficulty], background: diffColor[c.difficulty] + '20', padding: '2px 8px', borderRadius: t.radius.full, fontWeight: 600 }}>
                    {diffLabel[c.difficulty]}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 20, fontSize: 13, color: t.colors.textMuted }}>
                  <span>📖 {c.lessonsCount || 0} уроков</span>
                  <span>👥 {c.enrollmentsCount || 0} студентов</span>
                  <span>🗂 {c.category?.name || 'Без категории'}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                <Link to={`/teacher/courses/${c.id}/edit`}
                  style={{ padding: '8px 16px', background: t.colors.primaryLight, color: t.colors.primary, borderRadius: t.radius.md, fontSize: 13, fontWeight: 700, border: `1px solid ${t.colors.primary}30` }}>
                  ✏️ Редактировать
                </Link>
                <Link to={`/analytics/course/${c.id}`}
                  style={{ padding: '8px 16px', background: t.colors.successLight, color: t.colors.success, borderRadius: t.radius.md, fontSize: 13, fontWeight: 700, border: `1px solid ${t.colors.success}30` }}>
                  📊 Аналитика
                </Link>
                {!c.isPublished ? (
                  <button onClick={() => handlePublish(c.id)}
                    style={{ padding: '8px 16px', background: t.colors.infoLight, color: t.colors.info, border: `1px solid ${t.colors.info}30`, borderRadius: t.radius.md, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                    🚀 Опубликовать
                  </button>
                ) : (
                  <button onClick={() => handleUnpublish(c.id)}
                    style={{ padding: '8px 16px', background: t.colors.warningLight, color: t.colors.warning, border: `1px solid ${t.colors.warning}30`, borderRadius: t.radius.md, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                    📥 Снять
                  </button>
                )}
                <button onClick={() => handleDelete(c.id, c.title)}
                  style={{ padding: '8px 12px', background: t.colors.dangerLight, color: t.colors.danger, border: `1px solid ${t.colors.danger}30`, borderRadius: t.radius.md, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
