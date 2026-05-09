import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import api from '../api/axios';
import { theme as t } from '../styles/theme';

const chartTooltipStyle = { background: t.colors.bgCard, border: `1px solid ${t.colors.border}`, borderRadius: 8, color: t.colors.text, fontSize: 13 };

const StatCard = ({ title, value, icon, color, trend }: any) => (
  <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 24, flex: 1, minWidth: 160, border: `1px solid ${t.colors.border}`, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: 11, color: t.colors.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: t.colors.text, letterSpacing: '-1px' }}>{value}</div>
      </div>
      <div style={{ width: 44, height: 44, borderRadius: t.radius.md, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
    </div>
  </div>
);

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
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: t.colors.text, letterSpacing: '-0.5px', marginBottom: 6 }}>Аналитика платформы</h1>
        <p style={{ color: t.colors.textSecondary, fontSize: 14 }}>Сводная статистика по всей образовательной платформе</p>
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
        <StatCard title="Пользователей" value={overview.totalUsers} icon="👥" color={t.colors.primary} />
        <StatCard title="Студентов" value={overview.totalStudents} icon="👨‍🎓" color={t.colors.info} />
        <StatCard title="Преподавателей" value={overview.totalTeachers} icon="👨‍🏫" color={t.colors.success} />
        <StatCard title="Курсов" value={overview.totalCourses} icon="📚" color={t.colors.warning} />
        <StatCard title="Записей" value={overview.totalEnrollments} icon="📝" color={t.colors.purple} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 24, border: `1px solid ${t.colors.border}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: t.colors.text, marginBottom: 20 }}>Топ курсов по записям</h3>
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

        <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 24, border: `1px solid ${t.colors.border}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: t.colors.text, marginBottom: 20 }}>Динамика записей и завершений</h3>
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

      {/* Top courses table */}
      <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 24, border: `1px solid ${t.colors.border}` }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: t.colors.text, marginBottom: 20 }}>Рейтинг курсов</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['#', 'Курс', 'Преподаватель', 'Категория', 'Записей'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, color: t.colors.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${t.colors.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topCourses.map((tc, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${t.colors.border}` }}
                onMouseEnter={e => (e.currentTarget.style.background = t.colors.bgSecondary)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: i < 3 ? `linear-gradient(135deg, ${t.colors.warning}, ${t.colors.danger})` : t.colors.bgSecondary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: i < 3 ? '#fff' : t.colors.textMuted }}>{i + 1}</span>
                </td>
                <td style={{ padding: '12px 14px', fontWeight: 600, color: t.colors.text, fontSize: 14 }}>{tc.course?.title}</td>
                <td style={{ padding: '12px 14px', color: t.colors.textSecondary, fontSize: 13 }}>{tc.course?.teacher?.firstName} {tc.course?.teacher?.lastName}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: 12, color: t.colors.info, background: t.colors.infoLight, padding: '3px 8px', borderRadius: t.radius.full, fontWeight: 600 }}>{tc.course?.category?.name || '—'}</span>
                </td>
                <td style={{ padding: '12px 14px', fontWeight: 800, color: t.colors.success, fontSize: 16 }}>{tc.enrollmentsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
