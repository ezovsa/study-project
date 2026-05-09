import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import LessonEditor from './LessonEditor';
import styles from './CourseEditor.module.css';

type Tab = 'info' | 'lessons';

export default function CourseEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('info');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [courseId, setCourseId] = useState<number | null>(isNew ? null : Number(id));
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
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

  const DIFF_OPTIONS = [
    { value: 'beginner', label: '🟢 Начальный', desc: 'Для новичков без опыта' },
    { value: 'intermediate', label: '🟡 Средний', desc: 'Базовые знания нужны' },
    { value: 'advanced', label: '🔴 Продвинутый', desc: 'Для опытных студентов' },
  ];

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div>
          <button onClick={() => navigate('/teacher/courses')} className={styles.backBtn}>← Мои курсы</button>
          <h1 className={styles.pageTitle}>{isNew ? 'Новый курс' : 'Редактирование курса'}</h1>
          {!isNew && (
            <span className={form.isPublished ? styles.badgePublished : styles.badgeDraft}>
              {form.isPublished ? '✅ Опубликован' : '📝 Черновик'}
            </span>
          )}
        </div>
        <div className={styles.headerActions}>
          {!isNew && !form.isPublished && (
            <button onClick={handlePublish} className={styles.publishBtn}>🚀 Опубликовать</button>
          )}
          <button onClick={handleSaveCourse} disabled={saving || !form.title} className={styles.saveBtn}>
            {saving ? '⏳ Сохранение...' : saved ? '✅ Сохранено!' : '💾 Сохранить'}
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        {([['info', '📋 Основная информация'], ['lessons', `📖 Уроки (${lessons.length})`]] as [Tab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} disabled={key === 'lessons' && isNew && !courseId}
            className={`${styles.tab} ${tab === key ? styles.tabActive : ''}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className={styles.infoGrid}>
          <div className={styles.mainCard}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Название курса *</label>
              <input className={styles.fieldInput} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Например: Основы Python для начинающих" required />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Описание</label>
              <textarea className={styles.fieldTextarea} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={5} placeholder="Расскажите, чему научатся студенты на этом курсе..." />
            </div>
          </div>

          <div className={styles.sideStack}>
            <div className={styles.sideCard}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Уровень сложности</label>
                <div className={styles.diffList}>
                  {DIFF_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, difficulty: opt.value }))}
                      className={`${styles.diffBtn} ${form.difficulty === opt.value ? styles.diffBtnActive : ''}`}>
                      <div className={styles.diffBtnLabel}>{opt.label}</div>
                      <div className={styles.diffBtnDesc}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={styles.fieldLabel}>Категория</label>
                <select className={styles.fieldSelect} value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                  <option value="">Без категории</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {isNew && (
              <div className={styles.hintCard}>
                <div className={styles.hintTitle}>💡 Подсказка</div>
                <div className={styles.hintBody}>Сначала сохраните основную информацию, затем добавьте уроки и задания.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'lessons' && courseId && (
        <div>
          <div className={styles.lessonsHeader}>
            <div className={styles.lessonsHint}>Перетащите уроки для изменения порядка или используйте стрелки</div>
            <button onClick={() => { setEditingLesson(null); setShowLessonForm(true); }} className={styles.addLessonBtn}>
              + Добавить урок
            </button>
          </div>

          {lessons.length === 0 ? (
            <div className={styles.emptyLessons}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>📖</div>
              <div className={styles.emptyTitle}>Уроков пока нет</div>
              <div className={styles.emptyDesc}>Добавьте первый урок в ваш курс</div>
              <button onClick={() => { setEditingLesson(null); setShowLessonForm(true); }} className={styles.addFirstBtn}>
                + Добавить первый урок
              </button>
            </div>
          ) : (
            <div className={styles.lessonList}>
              {lessons.map((lesson, idx) => (
                <div key={lesson.id} className={styles.lessonRow}>
                  <div className={styles.lessonRowInner}>
                    <div className={styles.orderBadge}>{idx + 1}</div>
                    <div className={styles.lessonInfo}>
                      <div className={styles.lessonTitle}>{lesson.title}</div>
                      <div className={styles.lessonMeta}>
                        <span>⏱ {lesson.durationMinutes} мин</span>
                        <span>📝 {lesson.assignments?.length || 0} заданий</span>
                        <span className={lesson.isPublished ? styles.statusPublished : styles.statusDraft}>
                          {lesson.isPublished ? '✅ Опубликован' : '📝 Черновик'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.moveButtons}>
                      <button onClick={() => handleMoveLesson(lesson.id, 'up')} disabled={idx === 0} className={styles.moveBtn}>↑</button>
                      <button onClick={() => handleMoveLesson(lesson.id, 'down')} disabled={idx === lessons.length - 1} className={styles.moveBtn}>↓</button>
                    </div>
                    <div className={styles.lessonActions}>
                      <button onClick={() => { setEditingLesson(lesson); setShowLessonForm(true); }} className={styles.editBtn}>✏️ Редактировать</button>
                      <button onClick={() => handleDeleteLesson(lesson.id)} className={styles.deleteBtn}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
