import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import api from '../api/axios';
import { theme as t } from '../styles/theme';

const chartTooltipStyle = { background: t.colors.bgCard, border: `1px solid ${t.colors.border}`, borderRadius: 8, color: t.colors.text, fontSize: 13 };

const StatCard = ({ title, value, sub, color, icon }: any) => (
  <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 20, flex: 1, minWidth: 140, border: `1px solid ${t.colors.border}`, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: 11, color: t.colors.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: t.colors.text, letterSpacing: '-1px' }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: t.colors.textMuted, marginTop: 4 }}>{sub}</div>}
      </div>
      <div style={{ fontSize: 22 }}>{icon}</div>
    </div>
  </div>
);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: t.colors.text, letterSpacing: '-0.5px', marginBottom: 6 }}>Аналитика курса</h1>
          <p style={{ color: t.colors.textSecondary, fontSize: 14 }}>Детальная статистика по студентам и урокам</p>
        </div>
        <Link to="/teacher/submissions" style={{ padding: '10px 20px', background: t.colors.warningLight, color: t.colors.warning, borderRadius: t.radius.md, fontWeight: 700, fontSize: 14, border: `1px solid ${t.colors.warning}30` }}>
          ✏️ Проверить задания
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
        <StatCard title="Студентов" value={overview.totalStudents} icon="👥" color={t.colors.primary} />
        <StatCard title="Завершили" value={overview.completedStudents} icon="🏆" color={t.colors.success} />
        <StatCard title="% завершения" value={`${overview.completionRate}%`} icon="📈" color={t.colors.info} />
        <StatCard title="Средний балл" value={overview.avgScore || '—'} sub="из 100" icon="⭐" color={t.colors.warning} />
        <StatCard title="Уроков" value={overview.totalLessons} icon="📖" color={t.colors.purple} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 24, border: `1px solid ${t.colors.border}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: t.colors.text, marginBottom: 20 }}>Среднее время на урок (мин)</h3>
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

        <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 24, border: `1px solid ${t.colors.border}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: t.colors.text, marginBottom: 20 }}>Средние баллы по заданиям</h3>
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

      {/* Students table */}
      <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 24, border: `1px solid ${t.colors.border}` }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: t.colors.text, marginBottom: 20 }}>Успеваемость студентов</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Студент', 'Email', 'Прогресс', 'Уроков', 'Средний балл'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, color: t.colors.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${t.colors.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${t.colors.border}` }}
                  onMouseEnter={e => (e.currentTarget.style.background = t.colors.bgSecondary)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {s.user.firstName?.[0]}{s.user.lastName?.[0]}
                      </div>
                      <span style={{ fontWeight: 600, color: t.colors.text, fontSize: 14 }}>{s.user.lastName} {s.user.firstName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', color: t.colors.textSecondary, fontSize: 13 }}>{s.user.email}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, background: t.colors.bgSecondary, borderRadius: t.radius.full, height: 6, minWidth: 80 }}>
                        <div style={{ height: '100%', width: `${s.percent}%`, background: `linear-gradient(90deg, ${t.colors.success}, ${t.colors.primary})`, borderRadius: t.radius.full }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: t.colors.success, minWidth: 36 }}>{s.percent}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', color: t.colors.textSecondary, fontSize: 14 }}>{s.completedLessons}/{s.totalLessons}</td>
                  <td style={{ padding: '12px 14px' }}>
                    {s.avgScore !== null ? (
                      <span style={{ background: s.avgScore >= 70 ? t.colors.successLight : t.colors.dangerLight, color: s.avgScore >= 70 ? t.colors.success : t.colors.danger, padding: '4px 12px', borderRadius: t.radius.full, fontWeight: 700, fontSize: 13 }}>{s.avgScore}</span>
                    ) : <span style={{ color: t.colors.textMuted }}>—</span>}
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
