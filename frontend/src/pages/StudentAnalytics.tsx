import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../api/axios';
import { theme as t } from '../styles/theme';
import StatCard from '../components/dashboard/StatCard';
import styles from './StudentAnalytics.module.css';

const COLORS = [t.colors.primary, t.colors.success, t.colors.warning, t.colors.danger, t.colors.purple];
const chartTooltipStyle = { background: t.colors.bgCard, border: `1px solid ${t.colors.border}`, borderRadius: 8, color: t.colors.text, fontSize: 13 };

export default function StudentAnalytics() {
  const { id } = useParams();
  const [overview, setOverview] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [weakSpots, setWeakSpots] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get(`/analytics/student/${id}/overview`),
      api.get(`/analytics/student/${id}/courses`),
      api.get(`/analytics/student/${id}/activity`),
      api.get(`/analytics/student/${id}/weak-spots`),
    ]).then(([o, c, a, w]) => { setOverview(o.data); setCourses(c.data); setActivity(a.data); setWeakSpots(w.data); });
  }, [id]);

  if (!overview) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120 }} />)}
    </div>
  );

  const activityData = activity.slice(-21).map(a => ({ date: a.date.slice(5), мин: Math.round(a.seconds / 60) }));
  const coursesChart = courses.map(c => ({ name: c.course?.title?.slice(0, 18) + (c.course?.title?.length > 18 ? '…' : ''), '%': c.percent }));
  const pieData = [
    { name: 'Завершено', value: overview.completedCourses },
    { name: 'В процессе', value: overview.totalCourses - overview.completedCourses },
  ].filter(d => d.value > 0);

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Моя аналитика</h1>
        <p className={styles.pageSubtitle}>Отслеживайте прогресс и выявляйте зоны роста</p>
      </div>

      <div className={styles.statsRow}>
        <StatCard title="Курсов" value={overview.totalCourses} icon="📚" color={t.colors.primary} />
        <StatCard title="Завершено" value={overview.completedCourses} icon="🏆" color={t.colors.success} />
        <StatCard title="Уроков" value={overview.completedLessons} icon="✅" color={t.colors.info} />
        <StatCard title="Средний балл" value={overview.avgScore || '—'} sub="из 100" icon="⭐" color={t.colors.warning} />
        <StatCard title="Часов" value={overview.totalHours} sub="обучения" icon="⏱" color={t.colors.purple} />
        <StatCard title="Заданий" value={overview.totalSubmissions} icon="📝" color={t.colors.danger} />
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Активность за последние 3 недели</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={t.colors.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={t.colors.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.colors.border} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: t.colors.textMuted }} />
              <YAxis tick={{ fontSize: 11, fill: t.colors.textMuted }} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(v: any) => [`${v} мин`, 'Время']} />
              <Area type="monotone" dataKey="мин" stroke={t.colors.primary} strokeWidth={2} fill="url(#actGrad)" dot={{ r: 3, fill: t.colors.primary }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Статус курсов</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ color: t.colors.textSecondary, fontSize: 13 }}>{v}</span>} />
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className={styles.noData}>Нет данных</div>}
        </div>
      </div>

      <div className={styles.progressCard}>
        <h3 className={styles.chartTitle}>Прогресс по курсам</h3>
        <ResponsiveContainer width="100%" height={Math.max(180, courses.length * 44)}>
          <BarChart data={coursesChart} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={t.colors.border} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: t.colors.textMuted }} tickFormatter={v => `${v}%`} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: t.colors.textSecondary }} width={150} />
            <Tooltip contentStyle={chartTooltipStyle} formatter={(v: any) => [`${v}%`, 'Прогресс']} />
            <Bar dataKey="%" fill={t.colors.success} radius={[0, 6, 6, 0]} background={{ fill: t.colors.bgSecondary, radius: 6 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {weakSpots.length > 0 && (
        <div className={styles.weakCard}>
          <h3 className={styles.weakTitle}>⚠️ Зоны роста</h3>
          <p className={styles.weakDesc}>Задания, в которых результат ниже 60% — уделите им больше внимания</p>
          <div className={styles.weakList}>
            {weakSpots.map((w, i) => (
              <div key={i} className={styles.weakItem}>
                <div className={styles.weakName}>{w.assignmentTitle}</div>
                <div className={styles.weakRight}>
                  <div className={styles.weakBar}>
                    <div className={styles.weakFill} style={{ width: `${w.percent}%` }} />
                  </div>
                  <span className={styles.weakScore}>{w.score}/{w.maxScore}</span>
                  <span className={styles.weakBadge}>{w.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
