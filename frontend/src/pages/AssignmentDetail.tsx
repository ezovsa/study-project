import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import styles from './AssignmentDetail.module.css';

const typeLabel = (type: string) =>
  type === 'quiz' ? '🧩 Тест' : type === 'file' ? '📎 Файл' : '✍️ Текстовый ответ';

export default function AssignmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/assignments/${id}`).then(r => setAssignment(r.data)).catch(() => {});
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post(`/assignments/${id}/submit`, { answerText: answer });
      setResult(data); setSubmitted(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка при отправке');
    }
    setSubmitting(false);
  };

  if (!assignment) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="skeleton" style={{ height: 60 }} />
      <div className="skeleton" style={{ height: 300 }} />
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <Link to={`/lessons/${assignment.lessonId}`} className={styles.backLink}>← Назад к уроку</Link>
      </div>

      <div className={styles.layout}>
        <div>
          <div className={styles.infoCard}>
            <span className={styles.typeBadge}>{typeLabel(assignment.type)}</span>
            <h1 className={styles.assignmentTitle}>{assignment.title}</h1>
            <div className={styles.descBox}>{assignment.description}</div>
          </div>

          {user?.role === 'student' && !submitted && (
            <div className={styles.submitCard}>
              <h2 className={styles.submitTitle}>Ваш ответ</h2>
              <form onSubmit={handleSubmit}>
                <textarea value={answer} onChange={e => setAnswer(e.target.value)} required rows={10}
                  className={styles.textarea}
                  placeholder="Введите ваш ответ или код решения..." />
                <div className={styles.submitRow}>
                  <div className={styles.charCount}>{answer.length} символов</div>
                  <button type="submit" disabled={submitting || !answer.trim()} className={styles.submitBtn}>
                    {submitting ? 'Отправка...' : '📤 Отправить ответ'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {submitted && result && (
            <div className={styles.resultCard}>
              <div className={styles.resultInner}>
                <div className={styles.resultIcon}>📬</div>
                <h2 className={styles.resultTitle}>Ответ отправлен!</h2>
                <p className={styles.resultText}>Ваш ответ принят и ожидает проверки преподавателем</p>
                <div className={styles.pendingBadge}>⏳ Ожидает проверки</div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <h3 className={styles.sidebarTitle}>Информация</h3>
            <div className={styles.infoList}>
              {[
                { icon: '⭐', label: 'Макс. балл', value: assignment.maxScore },
                { icon: '🔄', label: 'Попыток', value: assignment.attemptsAllowed },
                { icon: '📋', label: 'Тип', value: assignment.type === 'text' ? 'Текстовый' : assignment.type === 'quiz' ? 'Тест' : 'Файл' },
              ].map(item => (
                <div key={item.label} className={styles.infoRow}>
                  <span className={styles.infoLabel}>{item.icon} {item.label}</span>
                  <span className={styles.infoValue}>{item.value}</span>
                </div>
              ))}
            </div>
            {assignment.deadline && (
              <div className={styles.deadline}>
                ⏰ Дедлайн: {new Date(assignment.deadline).toLocaleDateString('ru-RU')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
