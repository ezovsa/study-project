import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import styles from './LessonDetail.module.css';

export default function LessonDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    api.get(`/lessons/${id}`).then(r => setLesson(r.data));
    startTime.current = Date.now();
    return () => {
      const spent = Math.round((Date.now() - startTime.current) / 1000);
      if (spent > 5) api.patch(`/lessons/${id}/progress`, { timeSpentSec: spent }).catch(() => {});
    };
  }, [id]);

  const handleComplete = async () => {
    setCompleting(true);
    await api.post(`/lessons/${id}/complete`);
    setCompleted(true); setCompleting(false);
  };

  if (!lesson) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="skeleton" style={{ height: 60 }} />
      <div className="skeleton" style={{ height: 400 }} />
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <Link to={`/courses/${lesson.courseId}`} className={styles.backLink}>← Назад к курсу</Link>
      </div>

      <div className={styles.layout}>
        <div>
          <div className={styles.mainCard}>
            <h1 className={styles.lessonTitle}>{lesson.title}</h1>
            <div className={styles.lessonDuration}>⏱ {lesson.durationMinutes} минут на изучение</div>

            {lesson.videoUrl && (
              <div className={styles.videoWrap}>
                <video controls className={styles.video} src={lesson.videoUrl} />
              </div>
            )}

            <div className={styles.lessonContent}>{lesson.content}</div>
          </div>

          {lesson.assignments?.length > 0 && (
            <div>
              <h2 className={styles.assignmentsTitle}>Задания к уроку</h2>
              <div className={styles.assignmentsList}>
                {lesson.assignments.map((a: any) => (
                  <Link key={a.id} to={`/assignments/${a.id}`} className={styles.assignmentLink}>
                    <div className={styles.assignmentCard}>
                      <div>
                        <div className={styles.assignmentTitle}>{a.title}</div>
                        <div className={styles.assignmentMeta}>Макс. балл: {a.maxScore} • Попыток: {a.attemptsAllowed}</div>
                      </div>
                      <div className={styles.assignmentArrow}>Выполнить →</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.sidebar}>
          {user?.role === 'student' && (
            <div className={styles.progressCard}>
              <h3 className={styles.progressTitle}>Прогресс урока</h3>
              {completed ? (
                <div className={styles.completedBadge}>
                  <div className={styles.completedIcon}>🎉</div>
                  <div className={styles.completedText}>Урок пройден!</div>
                </div>
              ) : (
                <button onClick={handleComplete} disabled={completing} className={styles.completeBtn}>
                  {completing ? 'Сохранение...' : '✅ Отметить как пройденный'}
                </button>
              )}
            </div>
          )}

          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>О уроке</h3>
            <div className={styles.infoList}>
              {[
                { icon: '⏱', label: 'Длительность', value: `${lesson.durationMinutes} мин` },
                { icon: '📝', label: 'Заданий', value: lesson.assignments?.length || 0 },
              ].map(item => (
                <div key={item.label} className={styles.infoRow}>
                  <span className={styles.infoLabel}>{item.icon} {item.label}</span>
                  <span className={styles.infoValue}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
