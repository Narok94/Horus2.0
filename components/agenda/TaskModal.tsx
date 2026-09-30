import React, { useState, useEffect } from 'react';
import { X, Clock, Tag, Calendar, AlertCircle, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'completed'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  taskToEdit?: Task | null;
  initialDate?: string;
}

export const CATEGORIES = [
  { name: 'Dieta', color: '#10B981', bg: '#10B98115' },
  { name: 'Saúde', color: '#16A34A', bg: '#16A34A15' },
  { name: 'Academia', color: '#F97316', bg: '#F9731615' },
  { name: 'Trabalho', color: '#2F5CFF', bg: '#2F5CFF15' },
  { name: 'Estudo', color: '#8B5CF6', bg: '#8B5CF615' },
  { name: 'Pessoal', color: '#EC4899', bg: '#EC489915' },
];

export const FREQUENCIES = [
  'Todos os dias',
  'Segunda a Sexta',
  'Ter, Qui, Sáb',
  'Seg, Qua, Sex',
  'Fins de semana',
  'Única'
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  taskToEdit,
  initialDate
}) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('11:00');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Dieta');
  const [repeatDays, setRepeatDays] = useState('Todos os dias');
  const [priority, setPriority] = useState(false);
  const [period, setPeriod] = useState<'hoje' | 'semana' | 'mes'>('hoje');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setTime(taskToEdit.time || '11:00');
      setDate(taskToEdit.date || initialDate || new Date().toISOString().split('T')[0]);
      setCategory(taskToEdit.category || 'Dieta');
      setRepeatDays(taskToEdit.repeatDays || 'Todos os dias');
      setPriority(taskToEdit.priority || false);
      setPeriod(taskToEdit.period || 'hoje');
      setNotes(taskToEdit.notes || '');
    } else {
      setTitle('');
      setTime('11:00');
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setCategory('Dieta');
      setRepeatDays('Todos os dias');
      setPriority(false);
      setPeriod('hoje');
      setNotes('');
    }
  }, [taskToEdit, isOpen, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: taskToEdit?.id,
      title: title.trim(),
      time,
      date,
      category,
      repeatDays,
      priority,
      period,
      notes: notes.trim()
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-[24px] shadow-xl border border-[#E3E8F1] w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3E8F1]">
            <h2 className="text-lg font-bold text-[#0E1730] font-display">
              {taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-[#F3F5FA] text-[#69708A] hover:text-[#0E1730] transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 font-sans">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#0E1730] font-display uppercase tracking-wider mb-1">
                Título da Tarefa
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Lanche (pré-treino), Beber água..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8F1] bg-[#F3F5FA] text-[#0E1730] font-medium text-sm focus:outline-none focus:border-[#2F5CFF] focus:bg-white transition-all"
                required
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#0E1730] font-display uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar size={12} className="text-[#2F5CFF]" /> Data
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8F1] bg-[#F3F5FA] text-[#0E1730] font-medium text-sm focus:outline-none focus:border-[#2F5CFF] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0E1730] font-display uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock size={12} className="text-[#2F5CFF]" /> Horário
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8F1] bg-[#F3F5FA] text-[#0E1730] font-medium text-sm focus:outline-none focus:border-[#2F5CFF] focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-[#0E1730] font-display uppercase tracking-wider mb-2 flex items-center gap-1">
                <Tag size={12} className="text-[#2F5CFF]" /> Categoria
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#2F5CFF] text-white shadow-xs'
                          : 'bg-[#F3F5FA] text-[#69708A] hover:bg-[#E3E8F1] hover:text-[#0E1730]'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: isSelected ? '#FFFFFF' : cat.color }}
                      />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-xs font-bold text-[#0E1730] font-display uppercase tracking-wider mb-1">
                Frequência / Repetição
              </label>
              <select
                value={repeatDays}
                onChange={(e) => setRepeatDays(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E3E8F1] bg-[#F3F5FA] text-[#0E1730] font-medium text-sm focus:outline-none focus:border-[#2F5CFF] focus:bg-white transition-all cursor-pointer"
              >
                {FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
            </div>

            {/* Priority Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F3F5FA] border border-[#E3E8F1]">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className={priority ? 'text-[#FF8A24]' : 'text-[#9AA1B8]'} />
                <div>
                  <p className="text-xs font-bold text-[#0E1730] font-display">Destaque / Alta Prioridade</p>
                  <p className="text-[11px] text-[#69708A]">Aparece com alerta destacado na agenda</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPriority(!priority)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  priority ? 'bg-[#FF8A24]' : 'bg-[#E3E8F1]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                    priority ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              {taskToEdit && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (taskToEdit.id) {
                      onDelete(taskToEdit.id);
                      onClose();
                    }
                  }}
                  className="mr-auto px-3.5 py-2 text-xs font-bold text-[#FF5252] hover:bg-[#FF5252]/10 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 size={14} />
                  <span>Excluir</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-[#69708A] hover:bg-[#F3F5FA] rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#2F5CFF] hover:bg-[#1E3FD6] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check size={14} strokeWidth={2.5} />
                <span>{taskToEdit ? 'Salvar Alterações' : 'Criar Tarefa'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
