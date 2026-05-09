import { Link } from 'react-router-dom';
import { Course } from '../../types';
import styles from './CourseCard.module.css';

const DIFF_CLASS: Record<string, string> = {
  beginner: styles.diffBeginner,
  intermediate: styles.diffIntermediate,
  advanced: styles.diffAdvanced,
};

const DIFF_LABEL: Record<string, string> = {
  beginner: 'Начальный',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
};

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link to={`/courses/${course.id}`} className={styles.link}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.category}>{course.category?.name || 'Без категории'}</span>
          <span className={`${styles.difficulty} ${DIFF_CLASS[course.difficulty]}`}>
            {DIFF_LABEL[course.difficulty]}
          </span>
        </div>
        <h3 className={styles.title}>{course.title}</h3>
        <p className={styles.description}>{course.description}</p>
        <div className={styles.footer}>
          <span>👤 {course.teacher?.firstName} {course.teacher?.lastName}</span>
          <span>📖 {course.lessonsCount || 0} уроков</span>
        </div>
      </div>
    </Link>
  );
}