import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { theme as t } from '../../styles/theme';
import LessonEditor from './LessonEditor';

type Tab = 'info' | 'lessons';

const Input = ({ label, value, onChange, type = 'text', placeholder = '', required = false }: any) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.colors.textSecondary, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
      style={{ width: '100%', padding: '11px 14px', background: t.colors.bgSecondary, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: t.colors.text, fontSize: 14, transition: 'all 0.2s' }} />
  </div>
);

const Textarea = ({ label, value, onChange, rows = 4, placeholder = '' }: any) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.colors.textSecondary, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
      style={{ width: '100%', padding: '11px 14px', background: t.colors.bgSecondary, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: t.colors.text, fontSize: 14, resize: 'vertical', lineHeight: 1.6, transition: 'all 0.2s' }} />
  </div>
);

export default function CourseEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tab, setTab] = useState<Tab>('info');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [courseId, setCourseId] = useState<number | null>(isNew ? null : Number(id));  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [showLessonForm, setShowLessonForm] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', difficulty: 'beginner', categoryId: '', isPublished: false,
  });

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data));
    if (!isNew) {
      api.get(`/courses/${id}`).then(async r => {
        const c = r.data;
        setForm({ title: c.title, description: c.description || '', difficulty: c.difficulty, categoryId: c.categoryId?.toString() || '', isPublished: c.isPublished });
        const sorted = c.lessons?.sort((a: any, b: any) => a.orderIndex - b.orderIndex) || [];
        const full = await Promise.all(sorted.map((l: any) => api.get(`/lessons/${l.id}`).then(r => r.data)));
        setLessons(full);
      });
    }
  }, [id]);

  const handleSaveCourse = async () => {
    setSaving(true);
    try {
      const payload = { ...form, categoryId: form.categoryId ? Number(form.categoryId) : null };
      if (isNew) {
        const { data } = await api.post('/courses', payload);
        setCourseId(data.id);
        navigate(`/teacher/courses/${data.id}/edit`, { replace: true });
        setTab('lessons');
      } else {
        await api.patch(`/courses/${id}`, payload);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  const reloadLessons = async (cid: number) => {
    const { data } = await api.get(`/courses/${cid}`);
    const sorted = data.lessons?.sort((a: any, b: any) => a.orderIndex - b.orderIndex) || [];
    // load each lesson with assignments
    const full = await Promise.all(sorted.map((l: any) => api.get(`/lessons/${l.id}`).then(r => r.data)));
    setLessons(full);
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Удалить урок?')) return;
    await api.delete(`/lessons/${lessonId}`);
    setLessons(prev => prev.filter(l => l.id !== lessonId));
  };

  const handleMoveLesson = async (lessonId: number, dir: 'up' | 'down') => {
    const idx = lessons.findIndex(l => l.id === lessonId);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= lessons.length) return;
    const updated = [...lessons];
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    // update orderIndex
    await Promise.all([
      api.patch(`/lessons/${updated[idx].id}`, { orderIndex: idx + 1 }),
      api.patch(`/lessons/${updated[swapIdx].id}`, { orderIndex: swapIdx + 1 }),
    ]);
    setLessons(updated.map((l, i) => ({ ...l, orderIndex: i + 1 })));
  };

  const handlePublish = async () => {
    if (!courseId) return;
    await api.post(`/courses/${courseId}/publish`);
    setForm(f => ({ ...f, isPublished: true }));
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <button onClick={() => navigate('/teacher/courses')} style={{ background: 'none', border: 'none', color: t.colors.primary, cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: 0, marginBottom: 8 }}>
            ← Мои курсы
          </button>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: t.colors.text, letterSpacing: '-0.5px', marginBottom: 4 }}>
            {isNew ? 'Новый курс' : 'Редактирование курса'}
          </h1>
          {!isNew && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: t.radius.full, fontWeight: 600, background: form.isPublished ? t.colors.successLight : t.colors.warningLight, color: form.isPublished ? t.colors.success : t.colors.warning }}>
                {form.isPublished ? '✅ Опубликован' : '📝 Черновик'}
              </span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {!isNew && !form.isPublished && (
            <button onClick={handlePublish}
              style={{ padding: '10px 20px', background: t.colors.successLight, color: t.colors.success, border: `1px solid ${t.colors.success}40`, borderRadius: t.radius.md, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
              🚀 Опубликовать
            </button>
          )}
          <button onClick={handleSaveCourse} disabled={saving || !form.title}
            style={{ padding: '10px 24px', background: form.title ? 'linear-gradient(135deg, #6c63ff, #a855f7)' : t.colors.textMuted, color: '#fff', border: 'none', borderRadius: t.radius.md, cursor: form.title ? 'pointer' : 'default', fontWeight: 700, fontSize: 14, boxShadow: form.title ? t.shadow.glow : 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            {saving ? '⏳ Сохранение...' : saved ? '✅ Сохранено!' : '💾 Сохранить'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: t.colors.bgSecondary, borderRadius: t.radius.md, padding: 4, width: 'fit-content', marginBottom: 24, border: `1px solid ${t.colors.border}` }}>
        {([['info', '📋 Основная информация'], ['lessons', `📖 Уроки (${lessons.length})`]] as [Tab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} disabled={key === 'lessons' && isNew && !courseId}
            style={{ padding: '8px 20px', borderRadius: t.radius.sm, border: 'none', cursor: key === 'lessons' && isNew && !courseId ? 'default' : 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.2s', background: tab === key ? 'linear-gradient(135deg, #6c63ff, #a855f7)' : 'transparent', color: tab === key ? '#fff' : t.colors.textSecondary, opacity: key === 'lessons' && isNew && !courseId ? 0.4 : 1 }}>
            {label}
          </button>
        ))}
      </div>

      {/* Info tab */}
      {tab === 'info' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 28, border: `1px solid ${t.colors.border}` }}>
            <Input label="Название курса *" value={form.title} onChange={(v: string) => setForm(f => ({ ...f, title: v }))} placeholder="Например: Основы Python для начинающих" required />
            <Textarea label="Описание" value={form.description} onChange={(v: string) => setForm(f => ({ ...f, description: v }))} rows={5} placeholder="Расскажите, чему научатся студенты на этом курсе..." />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 24, border: `1px solid ${t.colors.border}` }}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.colors.textSecondary, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Уровень сложности</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { value: 'beginner', label: '🟢 Начальный', desc: 'Для новичков без опыта' },
                    { value: 'intermediate', label: '🟡 Средний', desc: 'Базовые знания нужны' },
                    { value: 'advanced', label: '🔴 Продвинутый', desc: 'Для опытных студентов' },
                  ].map(opt => (
                    <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, difficulty: opt.value }))}
                      style={{ padding: '10px 14px', background: form.difficulty === opt.value ? t.colors.primaryLight : t.colors.bgSecondary, border: `2px solid ${form.difficulty === opt.value ? t.colors.primary : t.colors.border}`, borderRadius: t.radius.md, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                      <div style={{ fontWeight: 600, color: form.difficulty === opt.value ? t.colors.primary : t.colors.text, fontSize: 14 }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: t.colors.textMuted, marginTop: 2 }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.colors.textSecondary, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Категория</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', background: t.colors.bgSecondary, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: form.categoryId ? t.colors.text : t.colors.textMuted, fontSize: 14 }}>
                  <option value="">Без категории</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {isNew && (
              <div style={{ background: t.colors.primaryLight, borderRadius: t.radius.lg, padding: 16, border: `1px solid ${t.colors.primary}30` }}>
                <div style={{ fontSize: 13, color: t.colors.primary, fontWeight: 600, marginBottom: 6 }}>💡 Подсказка</div>
                <div style={{ fontSize: 13, color: t.colors.textSecondary, lineHeight: 1.6 }}>Сначала сохраните основную информацию, затем добавьте уроки и задания.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lessons tab */}
      {tab === 'lessons' && courseId && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ color: t.colors.textSecondary, fontSize: 14 }}>
              Перетащите уроки для изменения порядка или используйте стрелки
            </div>
            <button onClick={() => { setEditingLesson(null); setShowLessonForm(true); }}
              style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6c63ff, #a855f7)', color: '#fff', border: 'none', borderRadius: t.radius.md, cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: t.shadow.glow }}>
              + Добавить урок
            </button>
          </div>

          {lessons.length === 0 ? (
            <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 48, textAlign: 'center', border: `2px dashed ${t.colors.border}` }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>📖</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: t.colors.text, marginBottom: 8 }}>Уроков пока нет</div>
              <div style={{ color: t.colors.textSecondary, marginBottom: 20, fontSize: 14 }}>Добавьте первый урок в ваш курс</div>
              <button onClick={() => { setEditingLesson(null); setShowLessonForm(true); }}
                style={{ padding: '11px 24px', background: 'linear-gradient(135deg, #6c63ff, #a855f7)', color: '#fff', border: 'none', borderRadius: t.radius.md, cursor: 'pointer', fontWeight: 700, boxShadow: t.shadow.glow }}>
                + Добавить первый урок
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lessons.map((lesson, idx) => (
                <div key={lesson.id} style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, border: `1px solid ${t.colors.border}`, overflow: 'hidden', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = t.colors.borderLight)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = t.colors.border)}>
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* Order */}
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.colors.primaryLight, border: `2px solid ${t.colors.primary}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: t.colors.primary, flexShrink: 0 }}>
                      {idx + 1}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: t.colors.text, fontSize: 15, marginBottom: 3 }}>{lesson.title}</div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: t.colors.textMuted }}>
                        <span>⏱ {lesson.durationMinutes} мин</span>
                        <span>📝 {lesson.assignments?.length || 0} заданий</span>
                        <span style={{ color: lesson.isPublished ? t.colors.success : t.colors.warning }}>
                          {lesson.isPublished ? '✅ Опубликован' : '📝 Черновик'}
                        </span>
                      </div>
                    </div>

                    {/* Move buttons */}
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => handleMoveLesson(lesson.id, 'up')} disabled={idx === 0}
                        style={{ width: 30, height: 30, background: t.colors.bgSecondary, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? t.colors.textMuted : t.colors.textSecondary, fontSize: 14, opacity: idx === 0 ? 0.4 : 1 }}>↑</button>
                      <button onClick={() => handleMoveLesson(lesson.id, 'down')} disabled={idx === lessons.length - 1}
                        style={{ width: 30, height: 30, background: t.colors.bgSecondary, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, cursor: idx === lessons.length - 1 ? 'default' : 'pointer', color: idx === lessons.length - 1 ? t.colors.textMuted : t.colors.textSecondary, fontSize: 14, opacity: idx === lessons.length - 1 ? 0.4 : 1 }}>↓</button>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setEditingLesson(lesson); setShowLessonForm(true); }}
                        style={{ padding: '7px 14px', background: t.colors.primaryLight, color: t.colors.primary, border: `1px solid ${t.colors.primary}30`, borderRadius: t.radius.md, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                        ✏️ Редактировать
                      </button>
                      <button onClick={() => handleDeleteLesson(lesson.id)}
                        style={{ padding: '7px 10px', background: t.colors.dangerLight, color: t.colors.danger, border: `1px solid ${t.colors.danger}30`, borderRadius: t.radius.md, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lesson form modal */}
      {showLessonForm && courseId && (
        <LessonEditor
          courseId={courseId}
          lesson={editingLesson}
          orderIndex={lessons.length + 1}
          onSave={async () => { await reloadLessons(courseId); setShowLessonForm(false); setEditingLesson(null); }}
          onClose={() => { setShowLessonForm(false); setEditingLesson(null); }}
        />
      )}
    </div>
  );
}
