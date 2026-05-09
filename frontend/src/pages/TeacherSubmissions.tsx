import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Submission } from '../types';
import styles from './TeacherSubmissions.module.css';

type Tab = 'pending' | 'all';

type GradeEntry = { score: string; feedback: string };

function scoreClass(pct: number): string {
  if (pct >= 80) return styles.scoreHigh;
  if (pct >= 60) return styles.scoreMed;
  return styles.scoreLow;
}

function scorePercent(score: string, maxScore?: number): number {
  const n = Number(score);
  if (!n || !maxScore) return 0;
  return Math.round((n / maxScore) * 100);
}

export default function TeacherSubmissions() {
  const [tab, setTab] = useState<Tab>('pending');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<Record<number, GradeEntry>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const url = tab === 'pending' ? '/teacher/submissions/pending' : '/teacher/submissions/all';
    const { data } = await api.get<Submission[]>(url);
    setSubmissions(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [tab]);

  const handleGrade = async (sub: Submission) => {
    const g = grades[sub.id];
    if (!g?.score) return;
    setSaving(prev => ({ ...prev, [sub.id]: true }));
    await api.patch(`/submissions/${sub.id}/grade`, { score: Number(g.score), feedback: g.feedback || '' });
    setSaving(prev => ({ ...prev, [sub.id]: false }));
    if (tab === 'pending') setSubmissions(prev => prev.filter(s => s.id !== sub.id));
  };

  const setGrade = (id: number, field: keyof GradeEntry, value: string) => {
    setGrades(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  return (
    <div className="fade-in">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Проверка заданий</h1>
        <p className={styles.pageSubtitle}>Оценивайте ответы студентов и давайте обратную связь</p>
      </div>

      <div className={styles.tabs}>
        {(['pending', 'all'] as Tab[]).map(key => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`${styles.tab} ${tab === key ? styles.tabActive : ''}`}
          >
            {key === 'pending' ? '⏳ Ожидают проверки' : '📋 Все ответы'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.skeletons}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}
        </div>
      ) : submissions.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🎉</div>
          <div className={styles.emptyTitle}>
            {tab === 'pending' ? 'Все задания проверены!' : 'Ответов пока нет'}
          </div>
          <div className={styles.emptyText}>
            {tab === 'pending' ? 'Отличная работа — нет непроверенных заданий' : 'Студенты ещё не сдавали задания'}
          </div>
        </div>
      ) : (
        <div className={styles.list}>
          {submissions.map(sub => {
            const isExpanded = expanded === sub.id;
            const g: GradeEntry = grades[sub.id] ?? { score: sub.score?.toString() ?? '', feedback: sub.feedback ?? '' };
            const pct = scorePercent(g.score, sub.assignment?.maxScore);
            const pctClass = scoreClass(pct);

            return (
              <div
                key={sub.id}
                className={`${styles.submissionCard} ${isExpanded ? styles.submissionCardExpanded : ''}`}
              >
                <div className={styles.submissionHeader} onClick={() => setExpanded(isExpanded ? null : sub.id)}>
                  <div className={styles.avatar}>
                    {sub.user?.firstName?.[0]}{sub.user?.lastName?.[0]}
                  </div>
                  <div className={styles.submissionInfo}>
                    <div className={styles.studentName}>{sub.user?.lastName} {sub.user?.firstName}</div>
                    <div className={styles.submissionPath}>
                      <span className={styles.pathCourse}>{sub.assignment?.lesson?.course?.title}</span>
                      <span className={styles.pathSep}> → {sub.assignment?.lesson?.title} → </span>
                      <span className={styles.pathAssignment}>{sub.assignment?.title}</span>
                    </div>
                  </div>
                  <div className={styles.submissionMeta}>
                    <div className={styles.submissionDate}>
                      {new Date(sub.submittedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {sub.status === 'graded' ? (
                      <span className={styles.badgeGraded}>✅ {sub.score}/{sub.assignment?.maxScore}</span>
                    ) : (
                      <span className={styles.badgePending}>⏳ Ожидает</span>
                    )}
                    <span className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`}>›</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.expandedBody}>
                    <div className={styles.expandedGrid}>
                      <div>
                        <div className={styles.sectionLabel}>Ответ студента</div>
                        <div className={styles.answerBox}>
                          <pre className={styles.answerPre}>{sub.answerText || '(пустой ответ)'}</pre>
                        </div>
                        <div className={styles.answerMeta}>
                          Попытка #{sub.attemptNumber} • Сдано: {new Date(sub.submittedAt).toLocaleString('ru-RU')}
                        </div>
                      </div>

                      <div>
                        <div className={styles.sectionLabel}>Оценка</div>
                        <div className={styles.gradeBox}>
                          <div className={styles.scoreWrap}>
                            <label className={styles.scoreLabel}>Балл (макс. {sub.assignment?.maxScore})</label>
                            <div className={styles.scoreRow}>
                              <input
                                type="number"
                                min={0}
                                max={sub.assignment?.maxScore}
                                value={g.score}
                                onChange={e => setGrade(sub.id, 'score', e.target.value)}
                                disabled={sub.status === 'graded'}
                                className={styles.scoreInput}
                              />
                              {g.score && (
                                <div className={`${styles.progressWrap} ${pctClass}`}>
                                  <div className={styles.progressBar}>
                                    <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                                  </div>
                                  <div className={styles.progressPct}>{pct}%</div>
                                </div>
                              )}
                            </div>
                            {sub.status !== 'graded' && (
                              <div className={styles.quickScores}>
                                {[100, 90, 80, 70, 60, 50].map(p => (
                                  <button
                                    key={p}
                                    onClick={() => setGrade(sub.id, 'score', String(Math.round((sub.assignment?.maxScore ?? 0) * p / 100)))}
                                    className={styles.quickScoreBtn}
                                  >
                                    {p}%
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className={styles.feedbackWrap}>
                            <label className={styles.feedbackLabel}>Комментарий преподавателя</label>
                            <textarea
                              value={g.feedback}
                              onChange={e => setGrade(sub.id, 'feedback', e.target.value)}
                              disabled={sub.status === 'graded'}
                              rows={3}
                              placeholder="Напишите обратную связь студенту..."
                              className={styles.feedbackTextarea}
                            />
                          </div>

                          {sub.status !== 'graded' && (
                            <>
                              <div className={styles.templatesLabel}>Шаблоны:</div>
                              <div className={styles.templates}>
                                {[
                                  'Отличная работа! Всё выполнено верно.',
                                  'Хорошо, но есть небольшие недочёты.',
                                  'Задание выполнено частично. Нужно доработать.',
                                  'Требуется переработка. Обратитесь за помощью.',
                                ].map(tmpl => (
                                  <button
                                    key={tmpl}
                                    onClick={() => setGrade(sub.id, 'feedback', tmpl)}
                                    className={styles.templateBtn}
                                  >
                                    {tmpl}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}

                          {sub.status !== 'graded' ? (
                            <button
                              onClick={() => handleGrade(sub)}
                              disabled={!g.score || saving[sub.id]}
                              className={`${styles.gradeBtn} ${g.score && !saving[sub.id] ? styles.gradeBtnActive : styles.gradeBtnDisabled}`}
                            >
                              {saving[sub.id] ? 'Сохранение...' : '✅ Выставить оценку'}
                            </button>
                          ) : (
                            <div className={styles.gradedBadge}>
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
