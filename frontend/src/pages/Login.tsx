import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theme as t } from '../styles/theme';
import styles from './Login.module.css';

const QUICK_LOGINS = [
  { label: '👨‍🎓 Студент', email: 'student1@edu.ru', color: t.colors.info },
  { label: '👨‍🏫 Преподаватель', email: 'ivanov@edu.ru', color: t.colors.success },
  { label: '⚙️ Администратор', email: 'admin@edu.ru', color: t.colors.danger },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(email, password); navigate('/dashboard'); }
    catch { setError('Неверный email или пароль'); }
    finally { setLoading(false); }
  };

  const quickLogin = (e: string, p: string) => { setEmail(e); setPassword(p); };

  return (
    <div className={styles.page}>
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      <div className={styles.container}>
        <div className={styles.logoWrap}>
          <div className={styles.logoIcon}>🎓</div>
          <h1 className={styles.logoTitle}>EduPlatform</h1>
          <p className={styles.logoSub}>Платформа онлайн-обучения</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Вход в систему</h2>

          {error && (
            <div className={styles.error}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                required
                className={styles.input}
                placeholder="your@email.ru"
              />
            </div>
            <div className={styles.fieldLast}>
              <label className={styles.label}>Пароль</label>
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                required
                className={styles.input}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <p className={styles.registerLink}>
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </div>

        <div className={styles.quickLogin}>
          <div className={styles.quickLabel}>Быстрый вход</div>
          <div className={styles.quickButtons}>
            {QUICK_LOGINS.map(q => (
              <button
                key={q.email}
                onClick={() => quickLogin(q.email, 'password123')}
                className={styles.quickBtn}
                style={{ '--btn-color': q.color } as React.CSSProperties}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
