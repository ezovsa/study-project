import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../api/axios';
import { theme as t } from '../styles/theme';
import StatCard from '../components/dashboard/StatCard';
import styles from './AdminDashboard.module.css';

const chartTooltipStyle = { background: t.colors.bgCard, border: `1px solid ${t.colors.border}`, borderRadius: 8, color: t.colors.text, fontSize: 13 };

export default function AdminDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [completionRate, setCompletionRate] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/platform/overview'),
      api.get('/analytics/platform/top-courses'),
      api.get('/analytics/platform/completion-rate'),
    ]).then(([o, tc, cr]) => { setOverview(o.data); setTopCourses(tc.data); setCompletionRate(cr.data); });
  }, []);

  if (!overview) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120 }} />)}
    </div>
  );

  const topChart = topCourses.slice(0, 6).map(tc => ({ name: tc.course?.title?.slice(0, 18) + '…', записей: tc.enrollmentsCount }));
  const rateChart = completionRate.map(r => ({ месяц: r.month, всего: r.total, завершено: r.completed }));

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Аналитика платформы</h1>
        <p className={styles.pageSubtitle}>Сводная статистика по всей образовательной платформе</p>
      </div>

      <div className={styles.statsRow}>
        <StatCard title="Пользователей" value={overview.totalUsers} icon="👥" color={t.colors.primary} />
        <StatCard title="Студентов" value={overview.totalStudents} icon="👨‍🎓" color={t.colors.info} />
        <StatCard title="Преподавателей" value={overview.totalTeachers} icon="👨‍🏫" color={t.colors.success} />
        <StatCard title="Курсов" value={overview.totalCourses} icon="📚" color={t.colors.warning} />
        <StatCard title="Записей" value={overview.totalEnrollments} icon="📝" color={t.colors.purple} />
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Топ курсов по записям</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topChart} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={t.colors.border} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: t.colors.textMuted }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: t.colors.textSecondary }} width={130} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="записей" fill={t.colors.primary} radius={[0, 6, 6, 0]} background={{ fill: t.colors.bgSecondary, radius: 6 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Динамика записей и завершений</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={rateChart}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={t.colors.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={t.colors.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={t.colors.success} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={t.colors.success} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.colors.border} />
              <XAxis dataKey="месяц" tick={{ fontSize: 11, fill: t.colors.textMuted }} />
              <YAxis tick={{ fontSize: 11, fill: t.colors.textMuted }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="всего" stroke={t.colors.primary} strokeWidth={2} fill="url(#g1)" name="Записей" />
              <Area type="monotone" dataKey="завершено" stroke={t.colors.success} strokeWidth={2} fill="url(#g2)" name="Завершено" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.tableCard}>
        <h3 className={styles.tableTitle}>Рейтинг курсов</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              {['#', 'Курс', 'Преподаватель', 'Категория', 'Записей'].map(h => (
                <th key={h} className={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topCourses.map((tc, i) => (
              <tr key={i} className={styles.tr}>
                <td className={styles.td}>
                  <span className={`${styles.rankBadge} ${i < 3 ? styles.rankTop : styles.rankOther}`}>{i + 1}</span>
                </td>
                <td className={styles.td}>
                  <div className={styles.courseTitle}>{tc.course?.title}</div>
                </td>
                <td className={styles.td}>
                  <div className={styles.teacherName}>{tc.course?.teacher?.firstName} {tc.course?.teacher?.lastName}</div>
                </td>
                <td className={styles.td}>
                  <span className={styles.categoryBadge}>{tc.course?.category?.name || '—'}</span>
                </td>
                <td className={styles.td}>
                  <span className={styles.enrollCount}>{tc.enrollmentsCount}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
