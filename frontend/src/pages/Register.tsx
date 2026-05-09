import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import styles from './Register.module.css';

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
    <div className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.container}>
        <div className={styles.logoWrap}>
          <div className={styles.logoIcon}>🎓</div>
          <h1 className={styles.logoTitle}>Создать аккаунт</h1>
          <p className={styles.logoSub}>Присоединяйтесь к EduPlatform</p>
        </div>

        <div className={styles.card}>
          {error && <div className={styles.error}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className={styles.nameGrid}>
              {[{ key: 'firstName', label: 'Имя' }, { key: 'lastName', label: 'Фамилия' }].map(f => (
                <div key={f.key}>
                  <label className={styles.label}>{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required
                    className={styles.input} />
                </div>
              ))}
            </div>

            {[{ key: 'email', label: 'Email', type: 'email' }, { key: 'password', label: 'Пароль (мин. 6 символов)', type: 'password' }].map(f => (
              <div key={f.key} className={styles.field}>
                <label className={styles.label}>{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} type={f.type} required
                  className={styles.input} />
              </div>
            ))}

            <div className={styles.fieldLast}>
              <label className={styles.roleLabel}>Роль</label>
              <div className={styles.roleButtons}>
                {[{ value: 'student', label: '👨‍🎓 Студент' }, { value: 'teacher', label: '👨‍🏫 Преподаватель' }].map(r => (
                  <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                    className={`${styles.roleBtn} ${form.role === r.value ? styles.roleBtnActive : ''}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
            </button>
          </form>

          <p className={styles.loginLink}>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
