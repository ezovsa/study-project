import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { theme as t } from '../styles/theme';

const diffLabel: Record<string, string> = { beginner: 'Начальный', intermediate: 'Средний', advanced: 'Продвинутый' };
const diffColor: Record<string, string> = { beginner: t.colors.success, intermediate: t.colors.warning, advanced: t.colors.danger };

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: any = {};
    if (search) params.search = search;
    if (difficulty) params.difficulty = difficulty;
    api.get('/courses', { params }).then(r => { setCourses(r.data); setLoading(false); });
  }, [search, difficulty]);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: t.colors.text, letterSpacing: '-0.5px', marginBottom: 6 }}>Каталог курсов</h1>
        <p style={{ color: t.colors.textSecondary, fontSize: 14 }}>Найдите курс и начните обучение прямо сейчас</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: t.colors.textMuted, fontSize: 16 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по названию..."
            style={{ width: '100%', padding: '11px 14px 11px 40px', background: t.colors.bgCard, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: t.colors.text, fontSize: 14, transition: 'all 0.2s' }} />
        </div>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
          style={{ padding: '11px 14px', background: t.colors.bgCard, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: t.colors.text, fontSize: 14, minWidth: 160 }}>
          <option value="">Все уровни</option>
          <option value="beginner">Начальный</option>
          <option value="intermediate">Средний</option>
          <option value="advanced">Продвинутый</option>
        </select>
      </div>

      {/* Stats bar */}
      <div style={{ marginBottom: 20, color: t.colors.textSecondary, fontSize: 14 }}>
        Найдено курсов: <span style={{ color: t.colors.text, fontWeight: 700 }}>{courses.length}</span>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: 220 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {courses.map(c => (
            <Link key={c.id} to={`/courses/${c.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 24, border: `1px solid ${t.colors.border}`, height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = t.colors.primary; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = t.shadow.glow; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.colors.border; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 11, color: t.colors.info, background: t.colors.infoLight, padding: '4px 10px', borderRadius: t.radius.full, fontWeight: 600 }}>{c.category?.name || 'Без категории'}</span>
                  <span style={{ fontSize: 11, color: diffColor[c.difficulty], background: diffColor[c.difficulty] + '20', padding: '4px 10px', borderRadius: t.radius.full, fontWeight: 600 }}>{diffLabel[c.difficulty]}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: t.colors.text, marginBottom: 10, lineHeight: 1.4 }}>{c.title}</h3>
                <p style={{ fontSize: 13, color: t.colors.textSecondary, flex: 1, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 16 }}>{c.description}</p>
                <div style={{ borderTop: `1px solid ${t.colors.border}`, paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: 13, color: t.colors.textMuted }}>
                  <span>👤 {c.teacher?.firstName} {c.teacher?.lastName}</span>
                  <span>📖 {c.lessonsCount || 0} уроков</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {!loading && courses.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: t.colors.textSecondary }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.colors.text, marginBottom: 8 }}>Ничего не найдено</div>
          <div>Попробуйте изменить параметры поиска</div>
        </div>
      )}
    </div>
  );
}
