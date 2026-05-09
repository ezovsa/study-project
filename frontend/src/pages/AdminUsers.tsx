import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { theme as t } from '../styles/theme';

const roleLabel: Record<string, string> = { student: 'Студент', teacher: 'Преподаватель', admin: 'Администратор' };
const roleColor: Record<string, string> = { student: t.colors.info, teacher: t.colors.success, admin: t.colors.danger };

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

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: t.colors.text, letterSpacing: '-0.5px', marginBottom: 6 }}>Пользователи</h1>
        <p style={{ color: t.colors.textSecondary, fontSize: 14 }}>Управление аккаунтами платформы</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Всего', value: users.length, color: t.colors.primary },
          { label: 'Студентов', value: users.filter(u => u.role === 'student').length, color: t.colors.info },
          { label: 'Преподавателей', value: users.filter(u => u.role === 'teacher').length, color: t.colors.success },
          { label: 'Активных', value: users.filter(u => u.isActive).length, color: t.colors.warning },
        ].map(s => (
          <div key={s.label} style={{ background: t.colors.bgCard, borderRadius: t.radius.md, padding: '12px 20px', border: `1px solid ${t.colors.border}`, display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 13, color: t.colors.textSecondary }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t.colors.textMuted }}>🔍</span>
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Поиск по имени или email..."
            style={{ width: '100%', padding: '10px 12px 10px 36px', background: t.colors.bgCard, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: t.colors.text, fontSize: 14 }} />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          style={{ padding: '10px 14px', background: t.colors.bgCard, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: t.colors.text, fontSize: 14 }}>
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
        <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, border: `1px solid ${t.colors.border}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: t.colors.bgSecondary }}>
                {['Пользователь', 'Email', 'Роль', 'Статус', 'Регистрация', 'Действия'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: t.colors.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderTop: `1px solid ${t.colors.border}`, transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = t.colors.bgSecondary)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${roleColor[u.role]}, ${t.colors.primary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: t.colors.text, fontSize: 14 }}>{u.lastName} {u.firstName}</div>
                        <div style={{ fontSize: 12, color: t.colors.textMuted }}>ID: {u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: t.colors.textSecondary, fontSize: 13 }}>{u.email}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 12, color: roleColor[u.role], background: roleColor[u.role] + '20', padding: '4px 10px', borderRadius: t.radius.full, fontWeight: 700 }}>{roleLabel[u.role]}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 12, color: u.isActive ? t.colors.success : t.colors.danger, background: u.isActive ? t.colors.successLight : t.colors.dangerLight, padding: '4px 10px', borderRadius: t.radius.full, fontWeight: 700 }}>
                      {u.isActive ? '● Активен' : '● Заблокирован'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: t.colors.textMuted, fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString('ru-RU')}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {u.role === 'student' && (
                        <Link to={`/analytics/student/${u.id}`} style={{ padding: '5px 10px', background: t.colors.primaryLight, color: t.colors.primary, borderRadius: t.radius.sm, fontSize: 12, fontWeight: 600 }}>📊</Link>
                      )}
                      <button onClick={() => handleToggle(u)} style={{ padding: '5px 10px', background: t.colors.warningLight, color: t.colors.warning, border: 'none', borderRadius: t.radius.sm, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                        {u.isActive ? '🔒' : '🔓'}
                      </button>
                      <button onClick={() => handleDelete(u.id)} style={{ padding: '5px 10px', background: t.colors.dangerLight, color: t.colors.danger, border: 'none', borderRadius: t.radius.sm, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: t.colors.textMuted }}>Пользователи не найдены</div>
          )}
        </div>
      )}
    </div>
  );
}
