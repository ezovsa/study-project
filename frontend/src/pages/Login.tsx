import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theme as t } from '../styles/theme';

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
    <div style={{ minHeight: '100vh', background: t.colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', top: '20%', left: '30%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '25%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg, #6c63ff, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px', boxShadow: t.shadow.glow }}>🎓</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: t.colors.text, letterSpacing: '-0.5px' }}>EduPlatform</h1>
          <p style={{ color: t.colors.textSecondary, fontSize: 14, marginTop: 4 }}>Платформа онлайн-обучения</p>
        </div>

        {/* Card */}
        <div style={{ background: t.colors.bgCard, borderRadius: t.radius.xl, padding: 32, border: `1px solid ${t.colors.border}`, boxShadow: t.shadow.lg }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.colors.text, marginBottom: 24 }}>Вход в систему</h2>

          {error && (
            <div style={{ background: t.colors.dangerLight, border: `1px solid ${t.colors.danger}40`, color: t.colors.danger, padding: '12px 16px', borderRadius: t.radius.md, marginBottom: 20, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.colors.textSecondary, marginBottom: 8 }}>Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
                style={{ width: '100%', padding: '12px 14px', background: t.colors.bgSecondary, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: t.colors.text, fontSize: 14, transition: 'all 0.2s' }}
                placeholder="your@email.ru" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.colors.textSecondary, marginBottom: 8 }}>Пароль</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" required
                style={{ width: '100%', padding: '12px 14px', background: t.colors.bgSecondary, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: t.colors.text, fontSize: 14, transition: 'all 0.2s' }}
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: loading ? t.colors.textMuted : 'linear-gradient(135deg, #6c63ff, #a855f7)', color: '#fff', border: 'none', borderRadius: t.radius.md, fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer', boxShadow: loading ? 'none' : t.shadow.glow, transition: 'all 0.2s', letterSpacing: '0.3px' }}>
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: t.colors.textSecondary, fontSize: 14 }}>
            Нет аккаунта? <Link to="/register" style={{ color: t.colors.primary, fontWeight: 600 }}>Зарегистрироваться</Link>
          </p>
        </div>

        {/* Quick login */}
        <div style={{ marginTop: 20, background: t.colors.bgSecondary, borderRadius: t.radius.lg, padding: 16, border: `1px solid ${t.colors.border}` }}>
          <div style={{ fontSize: 12, color: t.colors.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>Быстрый вход</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: '👨‍🎓 Студент', email: 'student1@edu.ru', color: t.colors.info },
              { label: '👨‍🏫 Преподаватель', email: 'ivanov@edu.ru', color: t.colors.success },
              { label: '⚙️ Администратор', email: 'admin@edu.ru', color: t.colors.danger },
            ].map(q => (
              <button key={q.email} onClick={() => quickLogin(q.email, 'password123')}
                style={{ flex: 1, padding: '8px 10px', background: 'transparent', border: `1px solid ${q.color}40`, borderRadius: t.radius.md, color: q.color, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { e.currentTarget.style.background = q.color + '20'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
