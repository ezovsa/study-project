import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import styles from './AdminUsers.module.css';

const roleLabel: Record<string, string> = { student: 'Студент', teacher: 'Преподаватель', admin: 'Администратор' };
const roleColor: Record<string, string> = { student: 'var(--info)', teacher: 'var(--success)', admin: 'var(--danger)' };
const avatarGradient: Record<string, string> = { student: 'var(--info)', teacher: 'var(--success)', admin: 'var(--danger)' };

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    api.get('/users').then(r => { setUsers(r.data); setLoading(false); });
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить пользователя?')) return;
    await api.delete(`/users/${id}`);
    setUsers(users.filter(u => u.id !== id));
  };

  const handleToggle = async (user: any) => {
    await api.patch(`/users/${user.id}`, { isActive: !user.isActive });
    setUsers(users.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
  };

  const filtered = users.filter(u => {
    const matchSearch = !filter || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(filter.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const statsData = [
    { label: 'Всего', value: users.length, color: 'var(--primary)' },
    { label: 'Студентов', value: users.filter(u => u.role === 'student').length, color: 'var(--info)' },
    { label: 'Преподавателей', value: users.filter(u => u.role === 'teacher').length, color: 'var(--success)' },
    { label: 'Активных', value: users.filter(u => u.isActive).length, color: 'var(--warning)' },
  ];

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Пользователи</h1>
        <p className={styles.pageSubtitle}>Управление аккаунтами платформы</p>
      </div>

      <div className={styles.stats}>
        {statsData.map(s => (
          <div key={s.label} className={styles.statChip} style={{ '--chip-color': s.color } as React.CSSProperties}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Поиск по имени или email..."
            className={styles.searchInput} />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className={styles.select}>
          <option value="">Все роли</option>
          <option value="student">Студенты</option>
          <option value="teacher">Преподаватели</option>
          <option value="admin">Администраторы</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: 60 }} />)}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                {['Пользователь', 'Email', 'Роль', 'Статус', 'Регистрация', 'Действия'].map(h => (
                  <th key={h} className={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}
                        style={{ background: `linear-gradient(135deg, ${avatarGradient[u.role]}, var(--primary))` }}>
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <div>
                        <div className={styles.userName}>{u.lastName} {u.firstName}</div>
                        <div className={styles.userId}>ID: {u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.td}><span className={styles.email}>{u.email}</span></td>
                  <td className={styles.td}>
                    <span className={styles.roleBadge} style={{ '--role-color': roleColor[u.role] } as React.CSSProperties}>
                      {roleLabel[u.role]}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span className={u.isActive ? styles.statusActive : styles.statusInactive}>
                      {u.isActive ? '● Активен' : '● Заблокирован'}
                    </span>
                  </td>
                  <td className={styles.td}><span className={styles.date}>{new Date(u.createdAt).toLocaleDateString('ru-RU')}</span></td>
                  <td className={styles.td}>
                    <div className={styles.actions}>
                      {u.role === 'student' && (
                        <Link to={`/analytics/student/${u.id}`} className={styles.actionAnalytics}>📊</Link>
                      )}
                      <button onClick={() => handleToggle(u)} className={styles.actionToggle}>
                        {u.isActive ? '🔒' : '🔓'}
                      </button>
                      <button onClick={() => handleDelete(u.id)} className={styles.actionDelete}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className={styles.empty}>Пользователи не найдены</div>}
        </div>
      )}
    </div>
  );
}
