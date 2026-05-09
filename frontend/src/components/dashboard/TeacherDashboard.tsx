import { Link } from 'react-router-dom';
import { Course, TeacherStats } from '../../types';
import { theme as t } from '../../styles/theme';
import StatCard from './StatCard';
import styles from './TeacherDashboard.module.css';

interface Props {
  stats: TeacherStats;
  courses: Course[];
  pendingCount: number;
}

export default function TeacherDashboard({ stats, courses, pendingCount }: Props) {
  return (
    <>
      <div className={styles.statsRow}>
        <StatCard title="Моих курсов" value={stats.totalCourses} icon="📚" color={t.colors.primary} />
        <StatCard title="Опубликовано" value={stats.publishedCourses} icon="✅" color={t.colors.success} />
        <StatCard title="Ожидают проверки" value={pendingCount} icon="✏️" color={t.colors.warning} sub="заданий" />
      </div>

      {pendingCount > 0 && (
        <Link to="/teacher/submissions" className={styles.pendingBanner}>
          <div className={styles.pendingIcon}>✏️</div>
          <div>
            <div className={styles.pendingTitle}>Есть непроверенные задания</div>
            <div className={styles.pendingSubtitle}>{pendingCount} заданий ожидают вашей оценки</div>
          </div>
          <div className={styles.pendingArrow}>Проверить →</div>
        </Link>
      )}

      <div className={styles.coursesHeader}>
        <h2 className={styles.sectionTitle}>Мои курсы</h2>
        <Link to="/teacher/courses/new" className={styles.createBtn}>+ Создать курс</Link>
      </div>

      <div className={styles.coursesGrid}>
        {courses.map(c => (
          <div key={c.id} className={styles.courseCard}>
            <div className={styles.courseCardHeader}>
              <h3 className={styles.courseTitle}>{c.title}</h3>
              <span className={`${styles.badge} ${c.isPublished ? styles.badgePublished : styles.badgeDraft}`}>
                {c.isPublished ? '✅ Опубликован' : '📝 Черновик'}
              </span>
            </div>
            <div className={styles.courseActions}>
              <Link to={`/courses/${c.id}`} className={`${styles.actionBtn} ${styles.actionView}`}>Открыть</Link>
              <Link to={`/analytics/course/${c.id}`} className={`${styles.actionBtn} ${styles.actionAnalytics}`}>Аналитика</Link>
              <Link to={`/teacher/courses/${c.id}/edit`} className={`${styles.actionBtn} ${styles.actionEdit}`}>Редактировать</Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
