import { useState, useEffect } from 'react';
import api from '../../api/axios';
import styles from './LessonEditor.module.css';

interface Props {
  courseId: number;
  lesson: any | null;
  orderIndex: number;
  onSave: () => void;
  onClose: () => void;
}

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
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{isNew ? '+ Новый урок' : `✏️ ${lesson.title}`}</h2>
          <button onClick={onClose} className={styles.closeBtn}>×</button>
        </div>

        <div className={styles.modalTabs}>
          {([['lesson', '📋 Урок'], ['assignments', `📝 Задания (${assignments.length})`]] as ['lesson' | 'assignments', string][]).map(([key, label]) => (
            <button key={key} onClick={() => setActiveSection(key)} disabled={key === 'assignments' && !lessonId}
              className={`${styles.tab} ${activeSection === key ? styles.tabActive : ''}`}>
              {label}
            </button>
          ))}
          {!lessonId && <span className={styles.tabHint}>Сначала сохраните урок</span>}
        </div>

        <div className={styles.modalBody}>
          {activeSection === 'lesson' && (
            <div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Название урока *</label>
                <input className={styles.fieldInput} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Например: Введение в переменные" />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Содержание урока</label>
                <textarea className={styles.fieldTextarea} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8}
                  placeholder="Напишите текст урока, объяснения, примеры кода..." />
              </div>
              <div className={styles.twoCol}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Ссылка на видео (необязательно)</label>
                  <input className={styles.fieldInput} value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="https://..." />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Длительность (минут)</label>
                  <input className={styles.fieldInput} type="number" value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))} />
                </div>
              </div>
              <div className={styles.toggleRow}>
                <button type="button" onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
                  className={`${styles.toggle} ${form.isPublished ? styles.toggleOn : ''}`}>
                  <div className={`${styles.toggleKnob} ${form.isPublished ? styles.toggleKnobOn : ''}`} />
                </button>
                <span className={styles.toggleLabel}>Опубликован</span>
              </div>
            </div>
          )}

          {activeSection === 'assignments' && (
            <div>
              {!showAssignForm ? (
                <>
                  <div className={styles.assignHeader}>
                    <button onClick={() => { setEditingAssignment(null); setShowAssignForm(true); }} className={styles.addAssignBtn}>
                      + Добавить задание
                    </button>
                  </div>

                  {loadingAssignments ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 64 }} />)}
                    </div>
                  ) : assignments.length === 0 ? (
                    <div className={styles.assignEmpty}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>📝</div>
                      <div className={styles.assignEmptyTitle}>Заданий нет</div>
                      <div className={styles.assignEmptyDesc}>Добавьте задания для проверки знаний студентов</div>
                    </div>
                  ) : (
                    <div className={styles.assignList}>
                      {assignments.map(a => (
                        <div key={a.id} className={styles.assignItem}>
                          <div className={styles.assignInfo}>
                            <div className={styles.assignTitle}>{a.title}</div>
                            <div className={styles.assignMeta}>
                              <span>{typeLabel[a.type]}</span>
                              <span>⭐ {a.maxScore} баллов</span>
                              <span>🔄 {a.attemptsAllowed} попытки</span>
                            </div>
                          </div>
                          <div className={styles.assignActions}>
                            <button onClick={() => { setEditingAssignment(a); setShowAssignForm(true); }} className={styles.assignEditBtn}>✏️</button>
                            <button onClick={() => handleDeleteAssignment(a.id)} className={styles.assignDeleteBtn}>🗑</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <div className={styles.assignFormHeader}>
                    <h3 className={styles.assignFormTitle}>
                      {editingAssignment ? 'Редактировать задание' : 'Новое задание'}
                    </h3>
                    <button onClick={() => { setShowAssignForm(false); setEditingAssignment(null); }} className={styles.backBtn}>← Назад</button>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Название задания *</label>
                    <input className={styles.fieldInput} value={assignForm.title} onChange={e => setAssignForm(f => ({ ...f, title: e.target.value }))} placeholder="Например: Практика: типы данных" />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Условие задания</label>
                    <textarea className={styles.fieldTextarea} value={assignForm.description} onChange={e => setAssignForm(f => ({ ...f, description: e.target.value }))} rows={5}
                      placeholder="Опишите задание подробно: что нужно сделать, какой результат ожидается..." />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Тип задания</label>
                    <div className={styles.typeRow}>
                      {[['text', '✍️ Текстовый ответ'], ['quiz', '🧩 Тест'], ['file', '📎 Загрузка файла']].map(([v, l]) => (
                        <button key={v} type="button" onClick={() => setAssignForm(f => ({ ...f, type: v }))}
                          className={`${styles.typeBtn} ${assignForm.type === v ? styles.typeBtnActive : ''}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.twoCol}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Максимальный балл</label>
                      <input className={styles.fieldInput} type="number" value={assignForm.maxScore} onChange={e => setAssignForm(f => ({ ...f, maxScore: e.target.value }))} />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Количество попыток</label>
                      <input className={styles.fieldInput} type="number" value={assignForm.attemptsAllowed} onChange={e => setAssignForm(f => ({ ...f, attemptsAllowed: e.target.value }))} />
                    </div>
                  </div>

                  <button onClick={handleSaveAssignment} disabled={saving || !assignForm.title} className={styles.submitAssignBtn}>
                    {saving ? 'Сохранение...' : editingAssignment ? '💾 Сохранить изменения' : '+ Добавить задание'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {activeSection === 'lesson' && (
          <div className={styles.modalFooter}>
            <button onClick={onClose} className={styles.cancelBtn}>Отмена</button>
            <button onClick={handleSaveLesson} disabled={saving || !form.title} className={styles.saveLessonBtn}>
              {saving ? 'Сохранение...' : isNew ? '💾 Сохранить и добавить задания' : '💾 Сохранить урок'}
            </button>
          </div>
        )}
        {activeSection === 'assignments' && lessonId && (
          <div className={styles.modalFooter}>
            <button onClick={onSave} className={styles.doneBtn}>✅ Готово</button>
          </div>
        )}
      </div>
    </div>
  );
}
