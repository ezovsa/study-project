import { Link } from 'react-router-dom';
import { StudentStats, Course } from '../../types';
import { theme as t } from '../../styles/theme';
import StatCard from './StatCard';
import CourseCard from './CourseCard';
import styles from './StudentDashboard.module.css';

interface Props {
  stats: StudentStats;
  courses: Course[];
}

export default function StudentDashboard({ stats, courses }: Props) {
  return (
    <>
      <div className={styles.statsRow}>
        <StatCard title="Курсов записано" value={stats.totalCourses} icon="📚" color={t.colors.primary} />
        <StatCard title="Уроков пройдено" value={stats.completedLessons} icon="✅" color={t.colors.success} />
        <StatCard title="Средний балл" value={stats.avgScore ?? '—'} icon="⭐" color={t.colors.warning} sub="из 100 баллов" />
        <StatCard title="Часов обучения" value={stats.totalHours} icon="⏱" color={t.colors.purple} sub="всего" />
      </div>
      <div className={styles.coursesHeader}>
        <h2 className={styles.sectionTitle}>Рекомендуемые курсы</h2>
        <Link to="/courses" className={styles.viewAll}>Все курсы →</Link>
      </div>
      <div className={styles.coursesGrid}>
        {courses.map(c => <CourseCard key={c.id} course={c} />)}
      </div>
    </>
  );
}