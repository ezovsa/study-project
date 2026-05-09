import React from 'react';
import { Link } from 'react-router-dom';
import { AdminStats } from '../../types';
import { theme as t } from '../../styles/theme';
import StatCard from './StatCard';
import styles from './AdminDashboard.module.css';

interface Props {
  stats: AdminStats;
}

const NAV_LINKS = [
  { to: '/admin/users', label: '👥 Пользователи', color: t.colors.primary },
  { to: '/admin/dashboard', label: '📊 Аналитика', color: t.colors.success },
  { to: '/reports', label: '📄 Отчёты', color: t.colors.purple },
  { to: '/courses', label: '📚 Все курсы', color: t.colors.info },
];

export default function AdminDashboard({ stats }: Props) {
  return (
    <>
      <div className={styles.statsRow}>
        <StatCard title="Пользователей" value={stats.totalUsers} icon="👥" color={t.colors.primary} />
        <StatCard title="Студентов" value={stats.totalStudents} icon="👨‍🎓" color={t.colors.info} />
        <StatCard title="Преподавателей" value={stats.totalTeachers} icon="👨‍🏫" color={t.colors.success} />
        <StatCard title="Курсов" value={stats.totalCourses} icon="📚" color={t.colors.warning} />
        <StatCard title="Записей" value={stats.totalEnrollments} icon="📝" color={t.colors.purple} />
      </div>
      <div className={styles.links}>
        {NAV_LINKS.map(btn => (
          <Link
            key={btn.to}
            to={btn.to}
            className={styles.navLink}
            style={{ '--link-color': btn.color } as React.CSSProperties}
          >
            {btn.label}
          </Link>
        ))}
      </div>
    </>
  );
}
