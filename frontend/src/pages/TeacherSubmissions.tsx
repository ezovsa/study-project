import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { theme as t } from '../styles/theme';

type Tab = 'pending' | 'all';

export default function TeacherSubmissions() {
  const [tab, setTab] = useState<Tab>('pending');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<Record<number, { score: string; feedback: string }>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const url = tab === 'pending' ? '/teacher/submissions/pending' : '/teacher/submissions/all';
    const { data } = await api.get(url);
    setSubmissions(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [tab]);

  const handleGrade = async (sub: any) => {
    const g = grades[sub.id];
    if (!g?.score) return;
    setSaving({ ...saving, [sub.id]: true });
    await api.patch(`/submissions/${sub.id}/grade`, { score: Number(g.score), feedback: g.feedback || '' });
    setSaved({ ...saved, [sub.id]: true });
    setSaving({ ...saving, [sub.id]: false });
    if (tab === 'pending') setSubmissions(prev => prev.filter(s => s.id !== sub.id));
  };

  const setGrade = (id: number, field: 'score' | 'feedback', value: string) => {
    setGrades(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const scorePercent = (score: string, max: number) => {
    const n = Number(score);
    if (!n || !max) return 0;
    return Math.round(n / max * 100);
  };

  const scoreColor = (pct: number) => pct >= 80 ? t.colors.success : pct >= 60 ? t.colors.warning : t.colors.danger;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: t.colors.text, letterSpacing: '-0.5px', marginBottom: 6 }}>Проверка заданий</h1>
        <p style={{ color: t.colors.textSecondary, fontSize: 14 }}>Оценивайте ответы студентов и давайте обратную связь</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: t.colors.bgSecondary, borderRadius: t.radius.md, padding: 4, width: 'fit-content', marginBottom: 24, border: `1px solid ${t.colors.border}` }}>
        {([['pending', '⏳ Ожидают проверки'], ['all', '📋 Все ответы']] as [Tab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '8px 20px', borderRadius: t.radius.sm, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.2s', background: tab === key ? 'linear-gradient(135deg, #6c63ff, #a855f7)' : 'transparent', color: tab === key ? '#fff' : t.colors.textSecondary, boxShadow: tab === key ? t.shadow.glow : 'none' }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}
        </div>
      ) : submissions.length === 0 ? (
        <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 60, textAlign: 'center', border: `1px solid ${t.colors.border}` }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.colors.text, marginBottom: 8 }}>
            {tab === 'pending' ? 'Все задания проверены!' : 'Ответов пока нет'}
          </div>
          <div style={{ color: t.colors.textSecondary, fontSize: 14 }}>
            {tab === 'pending' ? 'Отличная работа — нет непроверенных заданий' : 'Студенты ещё не сдавали задания'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {submissions.map(sub => {
            const isExpanded = expanded === sub.id;
            const g = grades[sub.id] || { score: sub.score?.toString() || '', feedback: sub.feedback || '' };
            const pct = scorePercent(g.score, sub.assignment?.maxScore);

            return (
              <div key={sub.id} style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, border: `1px solid ${isExpanded ? t.colors.primary : t.colors.border}`, overflow: 'hidden', transition: 'border-color 0.2s', boxShadow: isExpanded ? t.shadow.glow : 'none' }}>
                {/* Header */}
                <div onClick={() => setExpanded(isExpanded ? null : sub.id)}
                  style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Avatar */}
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0 }}>
                    {sub.user?.firstName?.[0]}{sub.user?.lastName?.[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: t.colors.text, fontSize: 15 }}>{sub.user?.lastName} {sub.user?.firstName}</div>
                    <div style={{ fontSize: 13, color: t.colors.textSecondary, marginTop: 2 }}>
                      <span style={{ color: t.colors.info }}>{sub.assignment?.lesson?.course?.title}</span>
                      <span style={{ color: t.colors.textMuted }}> → {sub.assignment?.lesson?.title}</span>
                      <span style={{ color: t.colors.textMuted }}> → </span>
                      <span style={{ fontWeight: 600, color: t.colors.text }}>{sub.assignment?.title}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <div style={{ fontSize: 12, color: t.colors.textMuted }}>{new Date(sub.submittedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                    {sub.status === 'graded' ? (
                      <span style={{ background: t.colors.successLight, color: t.colors.success, padding: '4px 10px', borderRadius: t.radius.full, fontSize: 12, fontWeight: 700 }}>✅ {sub.score}/{sub.assignment?.maxScore}</span>
                    ) : (
                      <span style={{ background: t.colors.warningLight, color: t.colors.warning, padding: '4px 10px', borderRadius: t.radius.full, fontSize: 12, fontWeight: 700 }}>⏳ Ожидает</span>
                    )}
                    <span style={{ color: t.colors.textMuted, fontSize: 18, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>›</span>
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${t.colors.border}`, padding: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      {/* Answer */}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: t.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Ответ студента</div>
                        <div style={{ background: t.colors.bgSecondary, borderRadius: t.radius.md, padding: 16, border: `1px solid ${t.colors.border}`, minHeight: 120 }}>
                          <pre style={{ fontSize: 13, color: t.colors.text, fontFamily: 'JetBrains Mono, Consolas, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, lineHeight: 1.6 }}>{sub.answerText || '(пустой ответ)'}</pre>
                        </div>
                        <div style={{ marginTop: 10, fontSize: 12, color: t.colors.textMuted }}>
                          Попытка #{sub.attemptNumber} • Сдано: {new Date(sub.submittedAt).toLocaleString('ru-RU')}
                        </div>
                      </div>

                      {/* Grading */}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: t.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Оценка</div>
                        <div style={{ background: t.colors.bgSecondary, borderRadius: t.radius.md, padding: 16, border: `1px solid ${t.colors.border}` }}>
                          {/* Score input */}
                          <div style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 13, color: t.colors.textSecondary, display: 'block', marginBottom: 8 }}>Балл (макс. {sub.assignment?.maxScore})</label>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <input type="number" min={0} max={sub.assignment?.maxScore} value={g.score}
                                onChange={e => setGrade(sub.id, 'score', e.target.value)}
                                disabled={sub.status === 'graded'}
                                style={{ width: 90, padding: '10px 12px', background: t.colors.bgCard, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: t.colors.text, fontSize: 16, fontWeight: 700 }} />
                              {g.score && (
                                <div style={{ flex: 1 }}>
                                  <div style={{ background: t.colors.border, borderRadius: t.radius.full, height: 8, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${pct}%`, background: scoreColor(pct), borderRadius: t.radius.full, transition: 'width 0.3s' }} />
                                  </div>
                                  <div style={{ fontSize: 12, color: scoreColor(pct), fontWeight: 700, marginTop: 4 }}>{pct}%</div>
                                </div>
                              )}
                            </div>
                            {/* Quick score buttons */}
                            {sub.status !== 'graded' && (
                              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                                {[100, 90, 80, 70, 60, 50].map(pct => (
                                  <button key={pct} onClick={() => setGrade(sub.id, 'score', String(Math.round(sub.assignment?.maxScore * pct / 100)))}
                                    style={{ padding: '4px 10px', background: t.colors.bgCard, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.full, color: t.colors.textSecondary, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = t.colors.primary; e.currentTarget.style.color = t.colors.primary; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = t.colors.border; e.currentTarget.style.color = t.colors.textSecondary; }}>
                                    {pct}%
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Feedback */}
                          <div style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 13, color: t.colors.textSecondary, display: 'block', marginBottom: 8 }}>Комментарий преподавателя</label>
                            <textarea value={g.feedback} onChange={e => setGrade(sub.id, 'feedback', e.target.value)}
                              disabled={sub.status === 'graded'} rows={3} placeholder="Напишите обратную связь студенту..."
                              style={{ width: '100%', padding: '10px 12px', background: t.colors.bgCard, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: t.colors.text, fontSize: 13, resize: 'vertical', lineHeight: 1.5 }} />
                          </div>

                          {/* Quick feedback templates */}
                          {sub.status !== 'graded' && (
                            <div style={{ marginBottom: 14 }}>
                              <div style={{ fontSize: 12, color: t.colors.textMuted, marginBottom: 6 }}>Шаблоны:</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {[
                                  'Отличная работа! Всё выполнено верно.',
                                  'Хорошо, но есть небольшие недочёты.',
                                  'Задание выполнено частично. Нужно доработать.',
                                  'Требуется переработка. Обратитесь за помощью.',
                                ].map(tmpl => (
                                  <button key={tmpl} onClick={() => setGrade(sub.id, 'feedback', tmpl)}
                                    style={{ padding: '6px 10px', background: 'transparent', border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, color: t.colors.textSecondary, fontSize: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = t.colors.primaryLight; e.currentTarget.style.color = t.colors.primary; e.currentTarget.style.borderColor = t.colors.primary; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.colors.textSecondary; e.currentTarget.style.borderColor = t.colors.border; }}>
                                    {tmpl}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {sub.status !== 'graded' ? (
                            <button onClick={() => handleGrade(sub)} disabled={!g.score || saving[sub.id]}
                              style={{ width: '100%', padding: '11px', background: g.score ? 'linear-gradient(135deg, #6c63ff, #a855f7)' : t.colors.textMuted, color: '#fff', border: 'none', borderRadius: t.radius.md, cursor: g.score ? 'pointer' : 'default', fontWeight: 700, fontSize: 14, boxShadow: g.score ? t.shadow.glow : 'none', transition: 'all 0.2s' }}>
                              {saving[sub.id] ? 'Сохранение...' : '✅ Выставить оценку'}
                            </button>
                          ) : (
                            <div style={{ background: t.colors.successLight, border: `1px solid ${t.colors.success}40`, borderRadius: t.radius.md, padding: '12px', textAlign: 'center', color: t.colors.success, fontWeight: 700 }}>
                              ✅ Оценка выставлена: {sub.score}/{sub.assignment?.maxScore}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
