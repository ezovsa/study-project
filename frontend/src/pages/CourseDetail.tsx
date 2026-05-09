import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import styles from './CourseDetail.module.css';

const DIFF_CLASS: Record<string, string> = {
  beginner: styles.diffBeginner,
  intermediate: styles.diffIntermediate,
  advanced: styles.diffAdvanced,
};
const DIFF_LABEL: Record<string, string> = { beginner: 'Начальный', intermediate: 'Средний', advanced: 'Продвинутый' };

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    api.get(`/courses/${id}`).then(r => setCourse(r.data));
    if (user?.role === 'student') {
      api.get(`/courses/${id}/progress`).then(r => { setProgress(r.data); setEnrolled(true); }).catch(() => {});
    }
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    await api.post(`/courses/${id}/enroll`);
    const r = await api.get(`/courses/${id}/progress`);
    setProgress(r.data); setEnrolled(true); setEnrolling(false);
  };

  const handlePublish = async () => {
    await api.post(`/courses/${id}/publish`);
    setCourse({ ...course, isPublished: true });
  };

  if (!course) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="skeleton" style={{ height: 200 }} />
      <div className="skeleton" style={{ height: 400 }} />
    </div>
  );

  const lessons = course.lessons?.sort((a: any, b: any) => a.orderIndex - b.orderIndex) || [];
  const completedIds = new Set(progress?.lessons?.filter((l: any) => l.progress?.isCompleted).map((l: any) => l.id));

  return (
    <div className="fade-in">
      <div className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroLayout}>
          <div className={styles.heroMain}>
            <div className={styles.badges}>
              <span className={styles.badgeCategory}>{course.category?.name}</span>
              <span className={`${styles.badgeDiff} ${DIFF_CLASS[course.difficulty]}`}>{DIFF_LABEL[course.difficulty]}</span>
              {course.isPublished
                ? <span className={styles.badgePublished}>✅ Опубликован</span>
                : <span className={styles.badgeDraft}>📝 Черновик</span>}
            </div>
            <h1 className={styles.courseTitle}>{course.title}</h1>
            <p className={styles.courseDesc}>{course.description}</p>
            <div className={styles.courseMeta}>
              <span>👤 {course.teacher?.firstName} {course.teacher?.lastName}</span>
              <span>📖 {lessons.length} уроков</span>
            </div>
          </div>

          <div className={styles.actionPanel}>
            {user?.role === 'student' && !enrolled && (
              <button onClick={handleEnroll} disabled={enrolling} className={styles.enrollBtn}>
                {enrolling ? 'Запись...' : '🚀 Записаться на курс'}
              </button>
            )}
            {user?.role === 'student' && enrolled && progress && (
              <div className={styles.progressPanel}>
                <div className={styles.progressEnrolled}>✅ Вы записаны</div>
                <div className={styles.progressLabels}>
                  <span>Прогресс</span>
                  <span className={styles.progressPct}>{progress.percent}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${progress.percent}%` }} />
                </div>
                <div className={styles.progressCount}>{progress.completedLessons} из {progress.totalLessons} уроков</div>
              </div>
            )}
            {user?.role === 'teacher' && course.teacherId === user.id && (
              <div className={styles.teacherActions}>
                {!course.isPublished && (
                  <button onClick={handlePublish} className={styles.publishBtn}>🚀 Опубликовать курс</button>
                )}
                <Link to={`/analytics/course/${id}`} className={styles.analyticsLink}>📊 Аналитика курса</Link>
                <Link to="/teacher/submissions" className={styles.submissionsLink}>✏️ Проверить задания</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <h2 className={styles.lessonsTitle}>Программа курса</h2>
      <div className={styles.lessonsList}>
        {lessons.map((lesson: any, i: number) => {
          const isCompleted = completedIds.has(lesson.id);
          return (
            <Link key={lesson.id} to={`/lessons/${lesson.id}`} className={styles.lessonLink}>
              <div className={`${styles.lessonCard} ${isCompleted ? styles.lessonCardCompleted : styles.lessonCardBase}`}>
                <div className={`${styles.lessonNum} ${isCompleted ? styles.lessonNumDone : styles.lessonNumPending}`}>
                  {isCompleted ? '✓' : i + 1}
                </div>
                <div className={styles.lessonInfo}>
                  <div className={styles.lessonTitle}>{lesson.title}</div>
                  <div className={styles.lessonDuration}>⏱ {lesson.durationMinutes} мин</div>
                </div>
                <div className={styles.lessonChevron}>›</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
