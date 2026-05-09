import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import styles from './MyCourses.module.css';

const DIFF_LABEL: Record<string, string> = { beginner: 'Начальный', intermediate: 'Средний', advanced: 'Продвинутый' };
const DIFF_COLOR: Record<string, string> = {
  beginner: 'var(--success)',
  intermediate: 'var(--warning)',
  advanced: 'var(--danger)',
};

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

  const statsData = [
    { label: 'Всего курсов', value: courses.length, color: 'var(--primary)' },
    { label: 'Опубликовано', value: courses.filter(c => c.isPublished).length, color: 'var(--success)' },
    { label: 'Черновиков', value: courses.filter(c => !c.isPublished).length, color: 'var(--warning)' },
    { label: 'Студентов', value: courses.reduce((a, c) => a + (c.enrollmentsCount || 0), 0), color: 'var(--info)' },
  ];

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Мои курсы</h1>
          <p className={styles.pageSubtitle}>Создавайте и управляйте учебными курсами</p>
        </div>
        <button onClick={() => navigate('/teacher/courses/new')} className={styles.createBtn}>
          + Создать курс
        </button>
      </div>

      <div className={styles.stats}>
        {statsData.map(s => (
          <div key={s.label} className={styles.statChip} style={{ '--chip-color': s.color } as React.CSSProperties}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
        </div>
      ) : courses.length === 0 ? (
        <div className={styles.emptyCard}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <div className={styles.emptyTitle}>Курсов пока нет</div>
          <div className={styles.emptyDesc}>Создайте первый курс и начните обучать студентов</div>
          <button onClick={() => navigate('/teacher/courses/new')} className={styles.createFirstBtn}>
            + Создать первый курс
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {courses.map(c => (
            <div key={c.id} className={styles.courseRow}>
              <div className={`${styles.statusBar} ${c.isPublished ? styles.statusPublished : styles.statusDraft}`} />

              <div className={styles.courseInfo}>
                <div className={styles.courseTitleRow}>
                  <h3 className={styles.courseTitle}>{c.title}</h3>
                  <span className={c.isPublished ? styles.badgePublished : styles.badgeDraft}>
                    {c.isPublished ? '✅ Опубликован' : '📝 Черновик'}
                  </span>
                  <span className={styles.diffBadge}
                    style={{ '--diff-color': DIFF_COLOR[c.difficulty] } as React.CSSProperties}>
                    {DIFF_LABEL[c.difficulty]}
                  </span>
                </div>
                <div className={styles.courseMeta}>
                  <span>📖 {c.lessonsCount || 0} уроков</span>
                  <span>👥 {c.enrollmentsCount || 0} студентов</span>
                  <span>🗂 {c.category?.name || 'Без категории'}</span>
                </div>
              </div>

              <div className={styles.actions}>
                <Link to={`/teacher/courses/${c.id}/edit`} className={styles.actionEdit}>✏️ Редактировать</Link>
                <Link to={`/analytics/course/${c.id}`} className={styles.actionAnalytics}>📊 Аналитика</Link>
                {!c.isPublished ? (
                  <button onClick={() => handlePublish(c.id)} className={styles.actionPublish}>🚀 Опубликовать</button>
                ) : (
                  <button onClick={() => handleUnpublish(c.id)} className={styles.actionUnpublish}>📥 Снять</button>
                )}
                <button onClick={() => handleDelete(c.id, c.title)} className={styles.actionDelete}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
