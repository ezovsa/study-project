import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { theme as t } from '../styles/theme';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: t.colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'fixed', top: '15%', right: '20%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #6c63ff, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 14px', boxShadow: t.shadow.glow }}>🎓</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: t.colors.text }}>Создать аккаунт</h1>
          <p style={{ color: t.colors.textSecondary, fontSize: 14, marginTop: 4 }}>Присоединяйтесь к EduPlatform</p>
        </div>

        <div style={{ background: t.colors.bgCard, borderRadius: t.radius.xl, padding: 32, border: `1px solid ${t.colors.border}`, boxShadow: t.shadow.lg }}>
          {error && <div style={{ background: t.colors.dangerLight, border: `1px solid ${t.colors.danger}40`, color: t.colors.danger, padding: '12px 16px', borderRadius: t.radius.md, marginBottom: 20, fontSize: 14 }}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              {[{ key: 'firstName', label: 'Имя' }, { key: 'lastName', label: 'Фамилия' }].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.colors.textSecondary, marginBottom: 6 }}>{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required
                    style={{ width: '100%', padding: '11px 12px', background: t.colors.bgSecondary, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: t.colors.text, fontSize: 14 }} />
                </div>
              ))}
            </div>
            {[{ key: 'email', label: 'Email', type: 'email' }, { key: 'password', label: 'Пароль (мин. 6 символов)', type: 'password' }].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.colors.textSecondary, marginBottom: 6 }}>{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} type={f.type} required
                  style={{ width: '100%', padding: '11px 12px', background: t.colors.bgSecondary, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: t.colors.text, fontSize: 14 }} />
              </div>
            ))}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.colors.textSecondary, marginBottom: 8 }}>Роль</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ value: 'student', label: '👨‍🎓 Студент' }, { value: 'teacher', label: '👨‍🏫 Преподаватель' }].map(r => (
                  <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                    style={{ flex: 1, padding: '10px', background: form.role === r.value ? t.colors.primaryLight : t.colors.bgSecondary, border: `2px solid ${form.role === r.value ? t.colors.primary : t.colors.border}`, borderRadius: t.radius.md, color: form.role === r.value ? t.colors.primary : t.colors.textSecondary, cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'all 0.2s' }}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', background: loading ? t.colors.textMuted : 'linear-gradient(135deg, #6c63ff, #a855f7)', color: '#fff', border: 'none', borderRadius: t.radius.md, fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer', boxShadow: loading ? 'none' : t.shadow.glow }}>
              {loading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, color: t.colors.textSecondary, fontSize: 14 }}>
            Уже есть аккаунт? <Link to="/login" style={{ color: t.colors.primary, fontWeight: 600 }}>Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
