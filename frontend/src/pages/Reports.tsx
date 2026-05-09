import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import styles from './Reports.module.css';

type Format = 'json' | 'csv';

export default function Reports() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [format, setFormat] = useState<Format>('json');
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
        const content = data.startsWith('﻿') ? data : '﻿' + data;
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

  const reportCards = [
    user?.role === 'student' && {
      key: 'my', icon: '📊', title: 'Мой отчёт', desc: 'Персональная статистика вашего обучения',
      btnLabel: 'Скачать мой отчёт', color: 'var(--primary)',
      onDownload: () => download(`/reports/student/${user.id}`, `my_report.${format}`, 'my'),
      disabled: false, children: null,
    },
    (user?.role === 'admin' || user?.role === 'teacher') && {
      key: 'student', icon: '👨‍🎓', title: 'Отчёт по студенту', desc: 'Прогресс, оценки и рекомендации для студента',
      btnLabel: 'Скачать отчёт', color: 'var(--info)',
      onDownload: () => download(`/reports/student/${selectedUser}`, `student_${selectedUser}.${format}`, 'student'),
      disabled: !selectedUser,
      children: (
        <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className={styles.cardSelect}>
          <option value="">Выберите студента...</option>
          {users.filter(u => u.role === 'student').map(u => (
            <option key={u.id} value={u.id}>{u.lastName} {u.firstName}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'course', icon: '📚', title: 'Отчёт по курсу', desc: 'Статистика успеваемости и активности по курсу',
      btnLabel: 'Скачать отчёт', color: 'var(--success)',
      onDownload: () => download(`/reports/course/${selectedCourse}`, `course_${selectedCourse}.${format}`, 'course'),
      disabled: !selectedCourse,
      children: (
        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className={styles.cardSelect}>
          <option value="">Выберите курс...</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      ),
    },
    user?.role === 'admin' && {
      key: 'platform', icon: '🏢', title: 'Сводный отчёт', desc: 'Полная статистика по всей платформе',
      btnLabel: 'Скачать сводный отчёт', color: 'var(--purple)',
      onDownload: () => download('/reports/platform', `platform_report.${format}`, 'platform'),
      disabled: false, children: null,
    },
  ].filter(Boolean) as any[];

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Отчёты</h1>
        <p className={styles.pageSubtitle}>Генерация и скачивание аналитических отчётов</p>
      </div>

      <div className={styles.formatBar}>
        <span className={styles.formatLabel}>Формат экспорта:</span>
        <div className={styles.formatToggle}>
          {(['json', 'csv'] as Format[]).map(f => (
            <button key={f} onClick={() => setFormat(f)}
              className={`${styles.formatBtn} ${format === f ? styles.formatBtnActive : ''}`}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <span className={styles.formatHint}>
          {format === 'json' ? '📋 Структурированные данные для разработчиков' : '📊 Таблица для Excel и Google Sheets'}
        </span>
      </div>

      <div className={styles.cardsGrid}>
        {reportCards.map(card => (
          <div key={card.key} className={styles.reportCard} style={{ '--card-color': card.color } as React.CSSProperties}>
            <div className={styles.cardTop}>
              <div className={styles.cardIcon}>{card.icon}</div>
              <div>
                <div className={styles.cardTitle}>{card.title}</div>
                <div className={styles.cardDesc}>{card.desc}</div>
              </div>
            </div>
            {card.children}
            <button onClick={card.onDownload} disabled={card.disabled || !!downloading} className={styles.downloadBtn}>
              {downloading === card.key ? '⏳ Генерация...' : `⬇️ ${card.btnLabel}`}
            </button>
          </div>
        ))}
      </div>

      <div className={styles.scheduleCard}>
        <div className={styles.scheduleTop}>
          <div className={styles.scheduleIcon}>⏰</div>
          <div>
            <div className={styles.scheduleTitle}>Автоматическая отправка</div>
            <div className={styles.scheduleDesc}>Настройте регулярную отправку отчётов на email</div>
          </div>
        </div>

        {scheduleMsg && <div className={styles.successMsg}>{scheduleMsg}</div>}

        <form onSubmit={handleSchedule} className={styles.scheduleForm}>
          <div>
            <label className={styles.scheduleLabel}>Email получателя</label>
            <input value={schedule.email} onChange={e => setSchedule({ ...schedule, email: e.target.value })}
              type="email" required placeholder="email@example.com" className={styles.scheduleInput} />
          </div>
          {[
            { label: 'Тип отчёта', key: 'type', options: [['student', 'По студенту'], ['course', 'По курсу'], ['platform', 'По платформе']] },
            { label: 'Периодичность', key: 'frequency', options: [['daily', 'Ежедневно'], ['weekly', 'Еженедельно'], ['monthly', 'Ежемесячно']] },
          ].map(f => (
            <div key={f.key}>
              <label className={styles.scheduleLabel}>{f.label}</label>
              <select value={(schedule as any)[f.key]} onChange={e => setSchedule({ ...schedule, [f.key]: e.target.value })}
                className={styles.scheduleSelect}>
                {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <button type="submit" className={styles.saveBtn}>💾 Сохранить</button>
        </form>
      </div>
    </div>
  );
}
