import { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theme as t } from '../styles/theme';
import styles from './Layout.module.css';

interface NavItemProps {
  to: string;
  icon: string;
  label: string;
  active: boolean;
  collapsed: boolean;
}

function NavItem({ to, icon, label, active, collapsed }: NavItemProps) {
  if (collapsed) {
    return (
      <Link
        to={to}
        title={label}
        className={`${styles.navItemCollapsed} ${active ? styles.navItemCollapsedActive : ''}`}
      >
        {icon}
      </Link>
    );
  }
  return (
    <Link to={to} className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}>
      <span className={styles.navIcon}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

const ROLE_LABEL: Record<string, string> = {
  student: 'Студент',
  teacher: 'Преподаватель',
  admin: 'Администратор',
};

const ROLE_COLOR: Record<string, string> = {
  student: t.colors.info,
  teacher: t.colors.success,
  admin: t.colors.danger,
};

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
  const roleLabel = ROLE_LABEL[user?.role ?? 'student'];
  const roleColor = ROLE_COLOR[user?.role ?? 'student'];

  return (
    <div className={styles.wrapper}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🎓</div>
          {!collapsed && (
            <div>
              <div className={styles.logoName}>EduPlatform</div>
              <div className={styles.logoSub}>Онлайн-обучение</div>
            </div>
          )}
        </div>

        <nav className={styles.nav}>
          {!collapsed && <div className={styles.navLabel}>Навигация</div>}
          {navItems.map(item => (
            <NavItem key={item.to} {...item} active={is(item.to)} collapsed={collapsed} />
          ))}
        </nav>

        <div className={styles.userSection}>
          {!collapsed && (
            <div className={styles.userCard}>
              <div className={styles.userCardInner}>
                <div
                  className={styles.avatar}
                  style={{ background: `linear-gradient(135deg, ${roleColor}, ${t.colors.primary})` }}
                >
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{user?.firstName} {user?.lastName}</div>
                  <div className={styles.userRole} style={{ color: roleColor }}>{roleLabel}</div>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`${styles.logoutBtn} ${collapsed ? styles.logoutBtnCollapsed : ''}`}
          >
            <span>🚪</span>{!collapsed && 'Выйти'}
          </button>
        </div>

        <button onClick={() => setCollapsed(!collapsed)} className={styles.collapseBtn}>
          {collapsed ? '›' : '‹'}
        </button>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarDate}>
            {new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className={styles.topbarUser}>
            <div className={styles.onlineDot} />
            <span className={styles.topbarUserName}>{user?.firstName} {user?.lastName}</span>
          </div>
        </header>

        <main className={`${styles.content} fade-in`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
