import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { theme as t } from '../styles/theme';

export default function Reports() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [schedule, setSchedule] = useState({ email: '', type: 'student', frequency: 'weekly' });
  const [scheduleMsg, setScheduleMsg] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'admin') api.get('/users').then(r => setUsers(r.data));
    api.get('/courses').then(r => setCourses(r.data));
  }, []);

  const download = async (url: string, filename: string, key: string) => {
    setDownloading(key);
    try {
      const { data } = await api.get(url, { params: { format }, responseType: 'text' });
      if (format === 'csv') {
        const content = data.startsWith('\uFEFF') ? data : '\uFEFF' + data;
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      } else {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        const blob = new Blob([JSON.stringify(parsed, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      }
    } finally { setDownloading(null); }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/reports/schedule', schedule);
    setScheduleMsg('✅ Расписание сохранено!');
    setTimeout(() => setScheduleMsg(''), 3000);
  };

  const ReportCard = ({ icon, title, desc, btnLabel, btnColor, onDownload, disabled, children }: any) => (
    <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 24, border: `1px solid ${t.colors.border}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 44, height: 44, borderRadius: t.radius.md, background: btnColor + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
        <div>
          <div style={{ fontWeight: 700, color: t.colors.text, fontSize: 16, marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 13, color: t.colors.textSecondary }}>{desc}</div>
        </div>
      </div>
      {children}
      <button onClick={onDownload} disabled={disabled || !!downloading}
        style={{ width: '100%', padding: '11px', background: disabled ? t.colors.textMuted : `linear-gradient(135deg, ${btnColor}, ${btnColor}cc)`, color: '#fff', border: 'none', borderRadius: t.radius.md, cursor: disabled ? 'default' : 'pointer', fontWeight: 700, fontSize: 14, transition: 'all 0.2s', opacity: downloading ? 0.7 : 1 }}>
        {downloading === title ? '⏳ Генерация...' : `⬇️ ${btnLabel}`}
      </button>
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: t.colors.text, letterSpacing: '-0.5px', marginBottom: 6 }}>Отчёты</h1>
        <p style={{ color: t.colors.textSecondary, fontSize: 14 }}>Генерация и скачивание аналитических отчётов</p>
      </div>

      {/* Format selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, background: t.colors.bgCard, borderRadius: t.radius.lg, padding: '16px 20px', border: `1px solid ${t.colors.border}` }}>
        <span style={{ fontSize: 14, color: t.colors.textSecondary, fontWeight: 600 }}>Формат экспорта:</span>
        <div style={{ display: 'flex', gap: 4, background: t.colors.bgSecondary, borderRadius: t.radius.md, padding: 4 }}>
          {(['json', 'csv'] as const).map(f => (
            <button key={f} onClick={() => setFormat(f)}
              style={{ padding: '7px 20px', borderRadius: t.radius.sm, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, transition: 'all 0.2s', background: format === f ? 'linear-gradient(135deg, #6c63ff, #a855f7)' : 'transparent', color: format === f ? '#fff' : t.colors.textSecondary, boxShadow: format === f ? t.shadow.glow : 'none' }}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 13, color: t.colors.textMuted }}>
          {format === 'json' ? '📋 Структурированные данные для разработчиков' : '📊 Таблица для Excel и Google Sheets'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 28 }}>
        {user?.role === 'student' && (
          <ReportCard icon="📊" title="Мой отчёт" desc="Персональная статистика вашего обучения" btnLabel="Скачать мой отчёт" btnColor={t.colors.primary}
            onDownload={() => download(`/reports/student/${user.id}`, `my_report.${format}`, 'Мой отчёт')}>
          </ReportCard>
        )}

        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <ReportCard icon="👨‍🎓" title="Отчёт по студенту" desc="Прогресс, оценки и рекомендации для студента" btnLabel="Скачать отчёт" btnColor={t.colors.info}
            disabled={!selectedUser} onDownload={() => download(`/reports/student/${selectedUser}`, `student_${selectedUser}.${format}`, 'Отчёт по студенту')}>
            <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', background: t.colors.bgSecondary, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: t.colors.text, fontSize: 14 }}>
              <option value="">Выберите студента...</option>
              {users.filter(u => u.role === 'student').map(u => (
                <option key={u.id} value={u.id}>{u.lastName} {u.firstName}</option>
              ))}
            </select>
          </ReportCard>
        )}

        <ReportCard icon="📚" title="Отчёт по курсу" desc="Статистика успеваемости и активности по курсу" btnLabel="Скачать отчёт" btnColor={t.colors.success}
          disabled={!selectedCourse} onDownload={() => download(`/reports/course/${selectedCourse}`, `course_${selectedCourse}.${format}`, 'Отчёт по курсу')}>
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', background: t.colors.bgSecondary, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: t.colors.text, fontSize: 14 }}>
            <option value="">Выберите курс...</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </ReportCard>

        {user?.role === 'admin' && (
          <ReportCard icon="🏢" title="Сводный отчёт" desc="Полная статистика по всей платформе" btnLabel="Скачать сводный отчёт" btnColor={t.colors.purple}
            onDownload={() => download('/reports/platform', `platform_report.${format}`, 'Сводный отчёт')}>
          </ReportCard>
        )}
      </div>

      {/* Schedule */}
      <div style={{ background: t.colors.bgCard, borderRadius: t.radius.lg, padding: 24, border: `1px solid ${t.colors.border}` }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: t.radius.md, background: t.colors.warningLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⏰</div>
          <div>
            <div style={{ fontWeight: 700, color: t.colors.text, fontSize: 16, marginBottom: 4 }}>Автоматическая отправка</div>
            <div style={{ fontSize: 13, color: t.colors.textSecondary }}>Настройте регулярную отправку отчётов на email</div>
          </div>
        </div>

        {scheduleMsg && (
          <div style={{ background: t.colors.successLight, border: `1px solid ${t.colors.success}40`, color: t.colors.success, padding: '12px 16px', borderRadius: t.radius.md, marginBottom: 16, fontWeight: 600 }}>{scheduleMsg}</div>
        )}

        <form onSubmit={handleSchedule} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {[
            { label: 'Email получателя', key: 'email', type: 'email', placeholder: 'email@example.com', width: 240 },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 13, color: t.colors.textSecondary, marginBottom: 6, fontWeight: 500 }}>{f.label}</label>
              <input value={(schedule as any)[f.key]} onChange={e => setSchedule({ ...schedule, [f.key]: e.target.value })}
                type={f.type} required placeholder={f.placeholder}
                style={{ width: f.width, padding: '10px 12px', background: t.colors.bgSecondary, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: t.colors.text, fontSize: 14 }} />
            </div>
          ))}
          {[
            { label: 'Тип отчёта', key: 'type', options: [['student', 'По студенту'], ['course', 'По курсу'], ['platform', 'По платформе']] },
            { label: 'Периодичность', key: 'frequency', options: [['daily', 'Ежедневно'], ['weekly', 'Еженедельно'], ['monthly', 'Ежемесячно']] },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 13, color: t.colors.textSecondary, marginBottom: 6, fontWeight: 500 }}>{f.label}</label>
              <select value={(schedule as any)[f.key]} onChange={e => setSchedule({ ...schedule, [f.key]: e.target.value })}
                style={{ padding: '10px 12px', background: t.colors.bgSecondary, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: t.colors.text, fontSize: 14 }}>
                {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <button type="submit" style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #ffaa00, #ff6b35)', color: '#fff', border: 'none', borderRadius: t.radius.md, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            💾 Сохранить
          </button>
        </form>
      </div>
    </div>
  );
}
