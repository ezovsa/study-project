import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import { theme as t } from '../styles/theme';
import StatCard from '../components/dashboard/StatCard';
import styles from './CourseAnalytics.module.css';

const chartTooltipStyle = { background: t.colors.bgCard, border: `1px solid ${t.colors.border}`, borderRadius: 8, color: t.colors.text, fontSize: 13 };

export default function CourseAnalytics() {
  const { id } = useParams();
  const [overview, setOverview] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get(`/analytics/course/${id}/overview`),
      api.get(`/analytics/course/${id}/students`),
      api.get(`/analytics/course/${id}/lessons`),
      api.get(`/analytics/course/${id}/assignments`),
    ]).then(([o, s, l, a]) => { setOverview(o.data); setStudents(s.data); setLessons(l.data); setAssignments(a.data); });
  }, [id]);

  if (!overview) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120 }} />)}
    </div>
  );

  const lessonsChart = lessons.map(l => ({ name: l.title?.slice(0, 16) + '…', мин: Math.round(l.avgTimeSec / 60) }));
  const assignmentsChart = assignments.map(a => ({ name: a.title?.slice(0, 16) + '…', балл: a.avgScore || 0 }));

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Аналитика курса</h1>
          <p className={styles.pageSubtitle}>Детальная статистика по студентам и урокам</p>
        </div>
        <Link to="/teacher/submissions" className={styles.submissionsLink}>
          ✏️ Проверить задания
        </Link>
      </div>

      <div className={styles.statsRow}>
        <StatCard title="Студентов" value={overview.totalStudents} icon="👥" color={t.colors.primary} />
        <StatCard title="Завершили" value={overview.completedStudents} icon="🏆" color={t.colors.success} />
        <StatCard title="% завершения" value={`${overview.completionRate}%`} icon="📈" color={t.colors.info} />
        <StatCard title="Средний балл" value={overview.avgScore || '—'} sub="из 100" icon="⭐" color={t.colors.warning} />
        <StatCard title="Уроков" value={overview.totalLessons} icon="📖" color={t.colors.purple} />
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Среднее время на урок (мин)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={lessonsChart}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.colors.border} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: t.colors.textMuted }} />
              <YAxis tick={{ fontSize: 11, fill: t.colors.textMuted }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="мин" fill={t.colors.info} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Средние баллы по заданиям</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={assignmentsChart}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.colors.border} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: t.colors.textMuted }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: t.colors.textMuted }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="балл" fill={t.colors.success} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.tableCard}>
        <h3 className={styles.tableTitle}>Успеваемость студентов</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['Студент', 'Email', 'Прогресс', 'Уроков', 'Средний балл'].map(h => (
                  <th key={h} className={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.studentCell}>
                      <div className={styles.avatar}>{s.user.firstName?.[0]}{s.user.lastName?.[0]}</div>
                      <span className={styles.studentName}>{s.user.lastName} {s.user.firstName}</span>
                    </div>
                  </td>
                  <td className={styles.td}><span className={styles.email}>{s.user.email}</span></td>
                  <td className={styles.td}>
                    <div className={styles.progressCell}>
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${s.percent}%` }} />
                      </div>
                      <span className={styles.progressPct}>{s.percent}%</span>
                    </div>
                  </td>
                  <td className={styles.td}><span className={styles.lessonsCount}>{s.completedLessons}/{s.totalLessons}</span></td>
                  <td className={styles.td}>
                    {s.avgScore !== null
                      ? <span className={s.avgScore >= 70 ? styles.scoreBadgeGood : styles.scoreBadgeBad}>{s.avgScore}</span>
                      : <span className={styles.scoreDash}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
