import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { theme as t } from '../../styles/theme';

interface Props {
  courseId: number;
  lesson: any | null;
  orderIndex: number;
  onSave: () => void;
  onClose: () => void;
}

const Input = ({ label, value, onChange, type = 'text', placeholder = '' }: any) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: t.colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', padding: '10px 12px', background: t.colors.bg, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: t.colors.text, fontSize: 14 }} />
  </div>
);

export default function LessonEditor({ courseId, lesson, orderIndex, onSave, onClose }: Props) {
  const isNew = !lesson;
  const [saving, setSaving] = useState(false);
  const [lessonId, setLessonId] = useState<number | null>(lesson?.id || null);
  const [activeSection, setActiveSection] = useState<'lesson' | 'assignments'>('lesson');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null);
  const [showAssignForm, setShowAssignForm] = useState(false);

  const [form, setForm] = useState({
    title: lesson?.title || '',
    content: lesson?.content || '',
    videoUrl: lesson?.videoUrl || '',
    durationMinutes: lesson?.durationMinutes?.toString() || '30',
    isPublished: lesson?.isPublished ?? true,
  });

  // Load full lesson with assignments when editing
  useEffect(() => {
    if (lesson?.id) {
      setLoadingAssignments(true);
      api.get(`/lessons/${lesson.id}`)
        .then(r => setAssignments(r.data.assignments || []))
        .finally(() => setLoadingAssignments(false));
    }
  }, [lesson?.id]);

  const [assignForm, setAssignForm] = useState({
    title: '', description: '', type: 'text', maxScore: '100', attemptsAllowed: '3',
  });

  useEffect(() => {
    if (editingAssignment) {
      setAssignForm({
        title: editingAssignment.title,
        description: editingAssignment.description || '',
        type: editingAssignment.type,
        maxScore: editingAssignment.maxScore?.toString() || '100',
        attemptsAllowed: editingAssignment.attemptsAllowed?.toString() || '3',
      });
    } else {
      setAssignForm({ title: '', description: '', type: 'text', maxScore: '100', attemptsAllowed: '3' });
    }
  }, [editingAssignment]);

  const handleSaveLesson = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload = { ...form, durationMinutes: Number(form.durationMinutes), orderIndex };
      if (isNew) {
        const { data } = await api.post(`/courses/${courseId}/lessons`, payload);
        setLessonId(data.id);
        setActiveSection('assignments');
      } else {
        await api.patch(`/lessons/${lesson.id}`, payload);
        onSave();
      }
    } finally { setSaving(false); }
  };

  const handleSaveAssignment = async () => {
    if (!assignForm.title || !lessonId) return;
    setSaving(true);
    try {
      const payload = { ...assignForm, maxScore: Number(assignForm.maxScore), attemptsAllowed: Number(assignForm.attemptsAllowed) };
      if (editingAssignment) {
        const { data } = await api.patch(`/assignments/${editingAssignment.id}`, payload);
        setAssignments(prev => prev.map(a => a.id === editingAssignment.id ? data : a));
      } else {
        const { data } = await api.post(`/lessons/${lessonId}/assignments`, payload);
        setAssignments(prev => [...prev, data]);
      }
      setShowAssignForm(false);
      setEditingAssignment(null);
    } finally { setSaving(false); }
  };

  const handleDeleteAssignment = async (aId: number) => {
    if (!confirm('Удалить задание?')) return;
    await api.delete(`/assignments/${aId}`);
    setAssignments(prev => prev.filter(a => a.id !== aId));
  };

  const typeLabel: Record<string, string> = { text: '✍️ Текстовый', quiz: '🧩 Тест', file: '📎 Файл' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: t.colors.bgCard, borderRadius: t.radius.xl, width: '100%', maxWidth: 760, maxHeight: '90vh', display: 'flex', flexDirection: 'column', border: `1px solid ${t.colors.border}`, boxShadow: t.shadow.lg }}>

        {/* Modal header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${t.colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: t.colors.text, margin: 0 }}>
            {isNew ? '+ Новый урок' : `✏️ ${lesson.title}`}
          </h2>
          <button onClick={onClose} style={{ background: t.colors.bgSecondary, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, width: 32, height: 32, cursor: 'pointer', color: t.colors.textSecondary, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '12px 24px', borderBottom: `1px solid ${t.colors.border}`, display: 'flex', gap: 4, background: t.colors.bgSecondary }}>
          {([['lesson', '📋 Урок'], ['assignments', `📝 Задания (${assignments.length})`]] as ['lesson' | 'assignments', string][]).map(([key, label]) => (
            <button key={key} onClick={() => setActiveSection(key)}
              disabled={key === 'assignments' && !lessonId}
              style={{ padding: '7px 16px', borderRadius: t.radius.sm, border: 'none', cursor: key === 'assignments' && !lessonId ? 'default' : 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s', background: activeSection === key ? 'linear-gradient(135deg, #6c63ff, #a855f7)' : 'transparent', color: activeSection === key ? '#fff' : t.colors.textSecondary, opacity: key === 'assignments' && !lessonId ? 0.4 : 1 }}>
              {label}
            </button>
          ))}
          {!lessonId && <span style={{ fontSize: 12, color: t.colors.textMuted, alignSelf: 'center', marginLeft: 8 }}>Сначала сохраните урок</span>}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* Lesson form */}
          {activeSection === 'lesson' && (
            <div>
              <Input label="Название урока *" value={form.title} onChange={(v: string) => setForm(f => ({ ...f, title: v }))} placeholder="Например: Введение в переменные" />
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: t.colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Содержание урока</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8}
                  placeholder="Напишите текст урока, объяснения, примеры кода..."
                  style={{ width: '100%', padding: '11px 14px', background: t.colors.bg, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: t.colors.text, fontSize: 14, resize: 'vertical', lineHeight: 1.7, fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Input label="Ссылка на видео (необязательно)" value={form.videoUrl} onChange={(v: string) => setForm(f => ({ ...f, videoUrl: v }))} placeholder="https://..." />
                <Input label="Длительность (минут)" value={form.durationMinutes} onChange={(v: string) => setForm(f => ({ ...f, durationMinutes: v }))} type="number" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button type="button" onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
                  style={{ width: 44, height: 24, borderRadius: 12, background: form.isPublished ? t.colors.success : t.colors.border, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: form.isPublished ? 23 : 3, transition: 'left 0.2s' }} />
                </button>
                <span style={{ fontSize: 14, color: t.colors.textSecondary }}>Опубликован</span>
              </div>
            </div>
          )}

          {/* Assignments */}
          {activeSection === 'assignments' && (
            <div>
              {!showAssignForm ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <button onClick={() => { setEditingAssignment(null); setShowAssignForm(true); }}
                      style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #6c63ff, #a855f7)', color: '#fff', border: 'none', borderRadius: t.radius.md, cursor: 'pointer', fontWeight: 700, fontSize: 13, boxShadow: t.shadow.glow }}>
                      + Добавить задание
                    </button>
                  </div>

                  {loadingAssignments ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 64 }} />)}
                    </div>
                  ) : assignments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: t.colors.textMuted }}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>📝</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: t.colors.textSecondary, marginBottom: 6 }}>Заданий нет</div>
                      <div style={{ fontSize: 13 }}>Добавьте задания для проверки знаний студентов</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {assignments.map(a => (
                        <div key={a.id} style={{ background: t.colors.bgSecondary, borderRadius: t.radius.md, padding: '14px 16px', border: `1px solid ${t.colors.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: t.colors.text, fontSize: 14, marginBottom: 4 }}>{a.title}</div>
                            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: t.colors.textMuted }}>
                              <span>{typeLabel[a.type]}</span>
                              <span>⭐ {a.maxScore} баллов</span>
                              <span>🔄 {a.attemptsAllowed} попытки</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => { setEditingAssignment(a); setShowAssignForm(true); }}
                              style={{ padding: '6px 12px', background: t.colors.primaryLight, color: t.colors.primary, border: `1px solid ${t.colors.primary}30`, borderRadius: t.radius.sm, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>✏️</button>
                            <button onClick={() => handleDeleteAssignment(a.id)}
                              style={{ padding: '6px 10px', background: t.colors.dangerLight, color: t.colors.danger, border: `1px solid ${t.colors.danger}30`, borderRadius: t.radius.sm, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>🗑</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Assignment form */
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: t.colors.text, margin: 0 }}>
                      {editingAssignment ? 'Редактировать задание' : 'Новое задание'}
                    </h3>
                    <button onClick={() => { setShowAssignForm(false); setEditingAssignment(null); }}
                      style={{ background: 'none', border: 'none', color: t.colors.textSecondary, cursor: 'pointer', fontSize: 13 }}>← Назад</button>
                  </div>

                  <Input label="Название задания *" value={assignForm.title} onChange={(v: string) => setAssignForm(f => ({ ...f, title: v }))} placeholder="Например: Практика: типы данных" />

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: t.colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Условие задания</label>
                    <textarea value={assignForm.description} onChange={e => setAssignForm(f => ({ ...f, description: e.target.value }))} rows={5}
                      placeholder="Опишите задание подробно: что нужно сделать, какой результат ожидается..."
                      style={{ width: '100%', padding: '11px 14px', background: t.colors.bg, border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, color: t.colors.text, fontSize: 14, resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit' }} />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: t.colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Тип задания</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[['text', '✍️ Текстовый ответ'], ['quiz', '🧩 Тест'], ['file', '📎 Загрузка файла']].map(([v, l]) => (
                        <button key={v} type="button" onClick={() => setAssignForm(f => ({ ...f, type: v }))}
                          style={{ flex: 1, padding: '9px 8px', background: assignForm.type === v ? t.colors.primaryLight : t.colors.bg, border: `2px solid ${assignForm.type === v ? t.colors.primary : t.colors.border}`, borderRadius: t.radius.md, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: assignForm.type === v ? t.colors.primary : t.colors.textSecondary, transition: 'all 0.2s' }}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Input label="Максимальный балл" value={assignForm.maxScore} onChange={(v: string) => setAssignForm(f => ({ ...f, maxScore: v }))} type="number" />
                    <Input label="Количество попыток" value={assignForm.attemptsAllowed} onChange={(v: string) => setAssignForm(f => ({ ...f, attemptsAllowed: v }))} type="number" />
                  </div>

                  <button onClick={handleSaveAssignment} disabled={saving || !assignForm.title}
                    style={{ width: '100%', padding: '12px', background: assignForm.title ? 'linear-gradient(135deg, #6c63ff, #a855f7)' : t.colors.textMuted, color: '#fff', border: 'none', borderRadius: t.radius.md, cursor: assignForm.title ? 'pointer' : 'default', fontWeight: 700, fontSize: 14, boxShadow: assignForm.title ? t.shadow.glow : 'none' }}>
                    {saving ? 'Сохранение...' : editingAssignment ? '💾 Сохранить изменения' : '+ Добавить задание'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeSection === 'lesson' && (
          <div style={{ padding: '16px 24px', borderTop: `1px solid ${t.colors.border}`, display: 'flex', justifyContent: 'flex-end', gap: 10, background: t.colors.bgSecondary }}>
            <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${t.colors.border}`, borderRadius: t.radius.md, cursor: 'pointer', color: t.colors.textSecondary, fontWeight: 600, fontSize: 14 }}>
              Отмена
            </button>
            <button onClick={handleSaveLesson} disabled={saving || !form.title}
              style={{ padding: '10px 24px', background: form.title ? 'linear-gradient(135deg, #6c63ff, #a855f7)' : t.colors.textMuted, color: '#fff', border: 'none', borderRadius: t.radius.md, cursor: form.title ? 'pointer' : 'default', fontWeight: 700, fontSize: 14, boxShadow: form.title ? t.shadow.glow : 'none' }}>
              {saving ? 'Сохранение...' : isNew ? '💾 Сохранить и добавить задания' : '💾 Сохранить урок'}
            </button>
          </div>
        )}
        {activeSection === 'assignments' && lessonId && (
          <div style={{ padding: '16px 24px', borderTop: `1px solid ${t.colors.border}`, display: 'flex', justifyContent: 'flex-end', background: t.colors.bgSecondary }}>
            <button onClick={onSave}
              style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #00d68f, #00b4d8)', color: '#fff', border: 'none', borderRadius: t.radius.md, cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: t.shadow.glowSuccess }}>
              ✅ Готово
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
