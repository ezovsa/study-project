import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { theme as t } from '../styles/theme';

export default function AssignmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/assignments/${id}`).then(r => setAssignment(r.data)).catch(() => {});
    if (user?.role === 'student') {
      // load previous submissions would need a dedicated endpoint
    }
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
        <Link to={`/lessons/${assignment.lessonId}`} style={{ color: t.colors.primary, fontSize: 14, fontWeight: 600 }}>← Назад к уроку</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        <div>
          {/* Assignment info */}
          <div style={{ background: t.colors.bgCard, borderRadius: t.radius.xl, padding: 28, border: `1px solid ${t.colors.border}`, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: t.colors.purple, background: t.colors.purpleLight, padding: '4px 12px', borderRadius: t.radius.full, fontWeight: 600 }}>
                {assignment.type === 'quiz' ? '🧩 Тест' : assignment.type === 'file' ? '📎 Файл' : '✍️ Текстовый ответ'}
              </span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: t.colors.text, marginBottom: 16, letterSpacing: '-0.3px' }}>{assignment.title}</h1>
            <div style={{ background: t.colors.bgSecondary, borderRadius: t.radius.md, padding: 20, border: `1px solid ${t.colors.border}`, lineHeight: 1.8, color: t.colors.textSecondary, fontSize: 15 }}>
              {assignment.description}
            </div>
          </div>

          {/* Submit form */}
          {user?.role === 'student' && !submitted && (
            <div style={{ background: t.colors.bgCard, borderRadius: t.radius.xl, padding: 28, border: `1px solid ${t.colors.border}` }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: t.colors.text, marginBottom: 20 }}>Ваш ответ</h2>
              <form onSubmit={handleSubmit}>
                <textarea value={answer} onChange={e => setAnswer(e.target.value)} required rows={10}
                  style={{ width: '100%', padding: '14px', background: t.colors.bgSecondary, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: t.colors.text, fontSize: 14, fontFamily: 'JetBrains Mono, Consolas, monospace', resize: 'vertical', lineHeight: 1.7, transition: 'all 0.2s' }}
                  placeholder="Введите ваш ответ или код решения..." />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                  <div style={{ fontSize: 13, color: t.colors.textMuted }}>{answer.length} символов</div>
                  <button type="submit" disabled={submitting || !answer.trim()}
                    style={{ padding: '12px 28px', background: answer.trim() ? 'linear-gradient(135deg, #6c63ff, #a855f7)' : t.colors.textMuted, color: '#fff', border: 'none', borderRadius: t.radius.md, cursor: answer.trim() ? 'pointer' : 'default', fontWeight: 700, fontSize: 15, boxShadow: answer.trim() ? t.shadow.glow : 'none', transition: 'all 0.2s' }}>
                    {submitting ? 'Отправка...' : '📤 Отправить ответ'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Result */}
          {submitted && result && (
            <div style={{ background: t.colors.bgCard, borderRadius: t.radius.xl, padding: 28, border: `1px solid ${t.colors.success}40` }}>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: t.colors.text, marginBottom: 8 }}>Ответ отправлен!</h2>
                <p style={{ color: t.colors.textSecondary, marginBottom: 20 }}>Ваш ответ принят и ожидает проверки преподавателем</p>
                <div style={{ display: 'inline-flex', gap: 8, background: t.colors.warningLight, border: `1px solid ${t.colors.warning}40`, borderRadius: t.radius.full, padding: '8px 20px', color: t.colors.warning, fontWeight: 700 }}>
                  ⏳ Ожидает проверки
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 88 }}>
          <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 20, border: `1px solid ${t.colors.border}` }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: t.colors.text, marginBottom: 16 }}>Информация</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '⭐', label: 'Макс. балл', value: assignment.maxScore },
                { icon: '🔄', label: 'Попыток', value: assignment.attemptsAllowed },
                { icon: '📋', label: 'Тип', value: assignment.type === 'text' ? 'Текстовый' : assignment.type === 'quiz' ? 'Тест' : 'Файл' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${t.colors.border}`, fontSize: 14 }}>
                  <span style={{ color: t.colors.textSecondary }}>{item.icon} {item.label}</span>
                  <span style={{ color: t.colors.text, fontWeight: 700 }}>{item.value}</span>
                </div>
              ))}
            </div>
            {assignment.deadline && (
              <div style={{ marginTop: 16, background: t.colors.dangerLight, border: `1px solid ${t.colors.danger}30`, borderRadius: t.radius.md, padding: '10px 14px', fontSize: 13, color: t.colors.danger, fontWeight: 600 }}>
                ⏰ Дедлайн: {new Date(assignment.deadline).toLocaleDateString('ru-RU')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
