import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

import styles from './Courses.module.css';

const diffLabel: Record<string, string> = { beginner: 'Начальный', intermediate: 'Средний', advanced: 'Продвинутый' };
const diffColor: Record<string, string> = {
  beginner: 'var(--success)',
  intermediate: 'var(--warning)',
  advanced: 'var(--danger)',
};

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
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Каталог курсов</h1>
        <p className={styles.pageSubtitle}>Найдите курс и начните обучение прямо сейчас</p>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по названию..."
            className={styles.searchInput} />
        </div>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className={styles.select}>
          <option value="">Все уровни</option>
          <option value="beginner">Начальный</option>
          <option value="intermediate">Средний</option>
          <option value="advanced">Продвинутый</option>
        </select>
      </div>

      <div className={styles.statsBar}>
        Найдено курсов: <strong>{courses.length}</strong>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: 220 }} />)}
        </div>
      ) : (
        <div className={styles.grid}>
          {courses.map(c => (
            <Link key={c.id} to={`/courses/${c.id}`} style={{ textDecoration: 'none' }}>
              <div className={styles.courseCard}>
                <div className={styles.cardTop}>
                  <span className={styles.categoryBadge}>{c.category?.name || 'Без категории'}</span>
                  <span className={styles.diffBadge}
                    style={{ '--diff-color': diffColor[c.difficulty] } as React.CSSProperties}>
                    {diffLabel[c.difficulty]}
                  </span>
                </div>
                <h3 className={styles.courseTitle}>{c.title}</h3>
                <p className={styles.courseDesc}>{c.description}</p>
                <div className={styles.cardFooter}>
                  <span>👤 {c.teacher?.firstName} {c.teacher?.lastName}</span>
                  <span>📖 {c.lessonsCount || 0} уроков</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {!loading && courses.length === 0 && (
        <div className={styles.empty}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div className={styles.emptyTitle}>Ничего не найдено</div>
          <div>Попробуйте изменить параметры поиска</div>
        </div>
      )}
    </div>
  );
}
