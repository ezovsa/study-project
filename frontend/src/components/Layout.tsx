import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theme as t } from '../styles/theme';

const NavItem = ({ to, icon, label, active }: { to: string; icon: string; label: string; active: boolean }) => (
  <Link to={to} style={{
    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
    borderRadius: t.radius.md, color: active ? '#fff' : t.colors.textSecondary,
    background: active ? 'linear-gradient(135deg, #6c63ff, #a855f7)' : 'transparent',
    boxShadow: active ? t.shadow.glow : 'none',
    transition: 'all 0.2s', fontSize: 14, fontWeight: active ? 600 : 400,
    marginBottom: 2,
  }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = t.colors.bgCardHover; e.currentTarget.style.color = '#fff'; }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.colors.textSecondary; } }}
  >
    <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>{icon}</span>
    <span>{label}</span>
  </Link>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const is = (path: string) => location.pathname.startsWith(path);

  const studentNav = [
    { to: '/dashboard', icon: '⚡', label: 'Главная' },
    { to: '/courses', icon: '📚', label: 'Курсы' },
    { to: `/analytics/student/${user?.id}`, icon: '📊', label: 'Моя аналитика' },
    { to: '/reports', icon: '📄', label: 'Отчёты' },
  ];
  const teacherNav = [
    { to: '/dashboard', icon: '⚡', label: 'Главная' },
    { to: '/courses', icon: '📚', label: 'Каталог курсов' },
    { to: '/teacher/courses', icon: '🎓', label: 'Мои курсы' },
    { to: '/teacher/submissions', icon: '✏️', label: 'Проверка заданий' },
    { to: '/reports', icon: '📄', label: 'Отчёты' },
  ];
  const adminNav = [
    { to: '/dashboard', icon: '⚡', label: 'Главная' },
    { to: '/courses', icon: '📚', label: 'Курсы' },
    { to: '/admin/dashboard', icon: '🏢', label: 'Аналитика' },
    { to: '/admin/users', icon: '👥', label: 'Пользователи' },
    { to: '/reports', icon: '📄', label: 'Отчёты' },
  ];

  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'teacher' ? teacherNav : studentNav;
  const roleLabel = user?.role === 'student' ? 'Студент' : user?.role === 'teacher' ? 'Преподаватель' : 'Администратор';
  const roleColor = user?.role === 'student' ? t.colors.info : user?.role === 'teacher' ? t.colors.success : t.colors.danger;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.colors.bg }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 72 : 240, flexShrink: 0, background: t.colors.bgSecondary,
        borderRight: `1px solid ${t.colors.border}`, display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s ease', overflow: 'hidden', position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: `1px solid ${t.colors.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6c63ff, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, boxShadow: t.shadow.glow }}>🎓</div>
          {!collapsed && <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '-0.3px' }}>EduPlatform</div>
            <div style={{ fontSize: 11, color: t.colors.textMuted }}>Онлайн-обучение</div>
          </div>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {!collapsed && <div style={{ fontSize: 11, color: t.colors.textMuted, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>Навигация</div>}
          {navItems.map(item => (
            collapsed
              ? <Link key={item.to} to={item.to} title={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 44, borderRadius: t.radius.md, marginBottom: 2, fontSize: 20, color: is(item.to) ? '#fff' : t.colors.textSecondary, background: is(item.to) ? 'linear-gradient(135deg, #6c63ff, #a855f7)' : 'transparent', transition: 'all 0.2s' }}>{item.icon}</Link>
              : <NavItem key={item.to} {...item} active={is(item.to)} />
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '12px', borderTop: `1px solid ${t.colors.border}` }}>
          {!collapsed && (
            <div style={{ background: t.colors.bgCard, borderRadius: t.radius.md, padding: '12px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${roleColor}, ${t.colors.primary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0 }}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.firstName} {user?.lastName}</div>
                  <div style={{ fontSize: 11, color: roleColor, fontWeight: 500 }}>{roleLabel}</div>
                </div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} style={{ width: '100%', padding: collapsed ? '10px' : '9px 12px', background: t.colors.dangerLight, color: t.colors.danger, border: `1px solid ${t.colors.danger}30`, borderRadius: t.radius.md, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = t.colors.danger; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = t.colors.dangerLight; e.currentTarget.style.color = t.colors.danger; }}>
            <span>🚪</span>{!collapsed && 'Выйти'}
          </button>
        </div>

        {/* Collapse btn */}
        <button onClick={() => setCollapsed(!collapsed)} style={{ position: 'absolute', top: 22, right: -12, width: 24, height: 24, borderRadius: '50%', background: t.colors.bgCard, border: `1px solid ${t.colors.border}`, cursor: 'pointer', color: t.colors.textSecondary, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          {collapsed ? '›' : '‹'}
        </button>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{ height: 60, background: t.colors.bgSecondary, borderBottom: `1px solid ${t.colors.border}`, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: t.colors.textMuted }}>
              {new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.colors.bgCard, borderRadius: t.radius.full, padding: '6px 14px', border: `1px solid ${t.colors.border}` }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.colors.success, boxShadow: `0 0 6px ${t.colors.success}` }} />
            <span style={{ fontSize: 13, color: t.colors.textSecondary }}>{user?.firstName} {user?.lastName}</span>
          </div>
        </header>

        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }} className="fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
