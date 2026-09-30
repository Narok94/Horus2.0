import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  Dumbbell, 
  Apple, 
  Settings, 
  Cloud, 
  CloudOff, 
  Plus, 
  Clock, 
  Tag, 
  Check, 
  Flame, 
  Coffee, 
  Utensils, 
  Repeat, 
  Edit2, 
  Trash2,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store';
import { AppTab, Task } from '../../types';
import { TaskModal, CATEGORIES } from '../agenda/TaskModal';

export const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Cardio em jejum (moderado)',
    time: '07:30',
    category: 'Saúde',
    repeatDays: 'Ter, Qui, Sáb',
    completed: false,
    priority: true,
    icon: 'Flame',
    period: 'hoje'
  },
  {
    id: 'task-2',
    title: 'Café da manhã',
    time: '08:30',
    category: 'Dieta',
    repeatDays: 'Todos os dias',
    completed: false,
    priority: false,
    icon: 'Coffee',
    period: 'hoje'
  },
  {
    id: 'task-3',
    title: 'Lanche (pré-treino)',
    time: '11:00',
    category: 'Dieta',
    repeatDays: 'Todos os dias',
    completed: false,
    priority: false,
    icon: 'Apple',
    period: 'hoje'
  },
  {
    id: 'task-4',
    title: 'Treino de força',
    time: '11:30',
    category: 'Academia',
    repeatDays: 'Segunda a Sexta',
    completed: false,
    priority: true,
    icon: 'Dumbbell',
    period: 'hoje'
  },
  {
    id: 'task-5',
    title: 'Almoço (pós-treino)',
    time: '13:30',
    category: 'Dieta',
    repeatDays: 'Todos os dias',
    completed: false,
    priority: false,
    icon: 'Apple',
    period: 'hoje'
  },
  {
    id: 'task-6',
    title: 'Lanche',
    time: '17:30',
    category: 'Dieta',
    repeatDays: 'Todos os dias',
    completed: false,
    priority: false,
    icon: 'Apple',
    period: 'hoje'
  },
  {
    id: 'task-7',
    title: 'Jantar',
    time: '20:30',
    category: 'Dieta',
    repeatDays: 'Todos os dias',
    completed: false,
    priority: false,
    icon: 'Apple',
    period: 'hoje'
  }
];

export const getWorkoutForDay = (dayIndex: number) => {
  switch (dayIndex) {
    case 1:
      return { code: 'A', title: 'Treino A (Peito e Bíceps)' };
    case 2:
      return { code: 'B', title: 'Treino B (Quadríceps, Panturrilha e Abdômen)' };
    case 3:
      return { code: 'C', title: 'Treino C (Costas e Tríceps)' };
    case 4:
      return { code: 'D', title: 'Treino D (Ombros, Trapézio e Abdômen)' };
    case 5:
      return { code: 'E', title: 'Treino E (Posterior, Glúteo, Panturrilha, Abdômen e Cardio)' };
    case 6:
      return { code: 'Sáb', title: 'Descanso Ativo / Cardio' };
    case 0:
    default:
      return { code: 'Dom', title: 'Descanso' };
  }
};

export const AgendaView: React.FC = () => {
  const { user, updateUserProfile, setActiveTab, syncStatus } = useStore();

  const [activePeriod, setActivePeriod] = useState<'hoje' | 'semana' | 'mes'>('hoje');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const selectedDateISO = useMemo(() => {
    return selectedDate.toISOString().split('T')[0];
  }, [selectedDate]);

  const tasks: Task[] = useMemo(() => {
    if (user?.tasks && user.tasks.length > 0) {
      return user.tasks;
    }
    return DEFAULT_TASKS;
  }, [user?.tasks]);

  useEffect(() => {
    if (!user?.tasks || user.tasks.length === 0 || !user.tasks.some(t => t.id === 'task-1')) {
      updateUserProfile({ tasks: DEFAULT_TASKS });
    }
  }, [user?.tasks, updateUserProfile]);

  const userName = user?.name || user?.username || 'Henrique';

  const dateDisplay = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short' };
    return selectedDate.toLocaleDateString('pt-BR', options).toUpperCase().replace('.', '');
  }, [selectedDate]);

  // Days for the week containing selectedDate (Monday to Sunday)
  const weekDays = useMemo(() => {
    const curr = new Date(selectedDate);
    const day = curr.getDay(); // 0 = Dom
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() + diffToMonday);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  const saveTasks = (newTasks: Task[]) => {
    updateUserProfile({ tasks: newTasks });
  };

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    saveTasks(updated);
  };

  const handleSaveModal = (data: Omit<Task, 'id' | 'completed'> & { id?: string }) => {
    if (data.id) {
      // Edit
      const updated = tasks.map(t => {
        if (t.id === data.id) {
          return {
            ...t,
            ...data,
          };
        }
        return t;
      });
      saveTasks(updated);
    } else {
      // Create
      const newTask: Task = {
        id: 'task-' + Date.now(),
        title: data.title,
        time: data.time,
        date: data.date || selectedDateISO,
        category: data.category,
        repeatDays: data.repeatDays,
        completed: false,
        priority: data.priority,
        period: data.period,
        notes: data.notes
      };
      saveTasks([...tasks, newTask]);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    saveTasks(updated);
  };

  const isTaskForDate = (task: Task, targetDate: Date) => {
    const targetISO = targetDate.toISOString().split('T')[0];
    const dayIndex = targetDate.getDay(); // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
    const rep = (task.repeatDays || 'Segunda a Sexta').toLowerCase();

    if (rep.includes('segunda a sexta') || rep.includes('seg a sex')) {
      return dayIndex >= 1 && dayIndex <= 5;
    }
    if (
      rep.includes('ter, qui, sáb') || 
      rep.includes('ter, qui, sab') || 
      rep.includes('ter/qui/sáb') ||
      (rep.includes('ter') && rep.includes('qui'))
    ) {
      return dayIndex === 2 || dayIndex === 4 || dayIndex === 6;
    }
    if (rep.includes('seg, qua, sex') || rep.includes('seg/qua/sex')) {
      return dayIndex === 1 || dayIndex === 3 || dayIndex === 5;
    }
    if (rep.includes('fins de semana') || rep.includes('fim de semana')) {
      return dayIndex === 0 || dayIndex === 6;
    }
    if (rep.includes('única') || rep.includes('unica')) {
      return task.date ? task.date === targetISO : true;
    }
    if (rep.includes('todos os dias') || rep.includes('diariamente')) {
      return true;
    }

    if (task.date && task.date === targetISO) {
      return true;
    }

    return true;
  };

  const formatTaskTitle = (task: Task, date: Date) => {
    const lower = task.title.toLowerCase();
    if (lower.includes('treino de força') || lower.includes('treino do dia') || task.category.toLowerCase() === 'academia') {
      const workout = getWorkoutForDay(date.getDay());
      return `Treino de força — ${workout.title}`;
    }
    return task.title;
  };

  // Filter tasks by selected date & active period and sort by time
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => isTaskForDate(t, selectedDate))
      .filter(t => {
        if (!t.period) return true;
        return t.period === activePeriod || activePeriod === 'hoje';
      })
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [tasks, selectedDate, activePeriod]);

  // Next relevant task
  const nextRelevantTask = useMemo(() => {
    const uncompleted = filteredTasks.filter(t => !t.completed);
    if (uncompleted.length === 0) return null;
    const priorityTask = uncompleted.find(t => t.priority);
    return priorityTask || uncompleted[0];
  }, [filteredTasks]);

  const getCategoryColor = (catName: string) => {
    const found = CATEGORIES.find(c => c.name.toLowerCase() === catName.toLowerCase());
    return found ? found.color : '#2F5CFF';
  };

  const renderTaskIcon = (task: Task) => {
    const lowerName = task.title.toLowerCase();
    const lowerCat = task.category.toLowerCase();

    if (lowerName.includes('cardio') || lowerCat.includes('saúde')) {
      return <Flame size={16} className="text-[#FF8A24]" />;
    }
    if (lowerName.includes('café') || lowerName.includes('coffee')) {
      return <Coffee size={16} className="text-[#2F5CFF]" />;
    }
    if (lowerCat.includes('dieta') || lowerName.includes('lanche') || lowerName.includes('almoço') || lowerName.includes('jantar')) {
      return <Apple size={16} className="text-[#10B981]" />;
    }
    if (lowerCat.includes('academia') || lowerName.includes('treino')) {
      return <Dumbbell size={16} className="text-[#F97316]" />;
    }
    return <Tag size={16} className="text-[#2F5CFF]" />;
  };

  return (
    <div className="w-full bg-[#EEF1F7] text-[#0E1730] font-sans pb-28 relative min-h-screen px-3 sm:px-5 md:px-6 pt-3 rounded-2xl sm:rounded-3xl">
      {/* Header */}
      <header className="flex flex-col gap-3 pt-2 pb-3 relative">
        <div className="flex justify-between items-start relative">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#69708A] uppercase tracking-wider font-display">
                {dateDisplay}
              </span>
              <button
                title={syncStatus === 'synced' ? "Conectado ao Banco" : "Sincronizando..."}
                className="inline-flex items-center justify-center p-1 rounded-md bg-[#F3F5FA] hover:bg-[#E3E8F1] transition-all cursor-pointer border border-[#E3E8F1] select-none"
              >
                {syncStatus === 'synced' ? (
                  <Cloud size={13} className="text-[#16A34A] fill-[#16A34A]/25" />
                ) : (
                  <CloudOff size={13} className="text-[#69708A]" />
                )}
              </button>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0E1730] flex items-center gap-2 mt-1 font-display">
              Bom dia, {userName} <span className="text-xl md:text-2xl">👋</span>
            </h1>
          </div>
          <button 
            onClick={() => setActiveTab(AppTab.PROFILE)}
            className="p-2 text-[#9AA1B8] hover:text-[#0E1730] transition-colors cursor-pointer active:scale-95"
          >
            <Settings size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Navigation Bar Pills */}
        <nav className="flex items-center gap-1.5 p-1 bg-[#F1F3F9] border border-[#E3E8F1] rounded-2xl w-fit mt-1">
          {[
            { id: 'agenda', label: 'Agenda', Icon: Calendar, activeColor: 'text-[#2F5CFF]', tab: AppTab.AGENDA },
            { id: 'academia', label: 'Academia', Icon: Dumbbell, activeColor: 'text-[#F97316]', tab: AppTab.DASHBOARD },
            { id: 'dieta', label: 'Dieta', Icon: Apple, activeColor: 'text-[#10B981]', tab: AppTab.DIET }
          ].map(({ id, label, Icon, activeColor, tab }) => {
            const isActive = id === 'agenda';
            return (
              <button
                key={id}
                onClick={() => setActiveTab(tab)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? 'bg-white text-[#0E1730] shadow-sm font-bold'
                    : 'text-[#69708A] hover:text-[#0E1730] hover:bg-white/50'
                }`}
              >
                <Icon size={15} className={isActive ? activeColor : 'text-[#69708A]'} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Date Navigation & Week Selector Bar */}
      <section className="bg-white border border-[#E3E8F1] rounded-xl p-2 shadow-xs my-2 font-sans">
        {/* Date Controls Header */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5 px-0.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const prev = new Date(selectedDate);
                prev.setDate(prev.getDate() - 7);
                setSelectedDate(prev);
              }}
              title="Semana anterior"
              className="p-1 rounded-lg bg-[#F3F5FA] hover:bg-[#E3E8F1] text-[#0E1730] transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-2 py-0.5 rounded-lg bg-[#2F5CFF]/10 text-[#2F5CFF] hover:bg-[#2F5CFF]/20 text-[11px] font-bold transition-all cursor-pointer font-display"
            >
              Hoje
            </button>
            <button
              onClick={() => {
                const next = new Date(selectedDate);
                next.setDate(next.getDate() + 7);
                setSelectedDate(next);
              }}
              title="Próxima semana"
              className="p-1 rounded-lg bg-[#F3F5FA] hover:bg-[#E3E8F1] text-[#0E1730] transition-colors cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#0E1730] font-display">
              {dateDisplay}
            </span>
            <label className="relative flex items-center justify-center p-1 rounded-lg bg-[#F3F5FA] hover:bg-[#E3E8F1] text-[#2F5CFF] cursor-pointer border border-[#E3E8F1]">
              <Calendar size={13} />
              <input
                type="date"
                value={selectedDateISO}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split('-').map(Number);
                    setSelectedDate(new Date(y, m - 1, d));
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>
          </div>
        </div>

        {/* 7-Day Week Strip */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d) => {
            const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
            const dayName = dayNames[d.getDay()];
            const dayNum = d.getDate();
            const isToday = d.toDateString() === new Date().toDateString();
            const isSelected = d.toDateString() === selectedDate.toDateString();

            return (
              <button
                key={d.toISOString()}
                onClick={() => setSelectedDate(d)}
                className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-lg transition-all cursor-pointer relative select-none ${
                  isSelected
                    ? 'bg-[#2F5CFF] text-white shadow-xs font-bold'
                    : 'bg-[#F8FAFC] text-[#69708A] hover:bg-[#E3E8F1]/60 hover:text-[#0E1730]'
                }`}
              >
                <span className={`text-[9px] font-bold font-display uppercase tracking-wider ${
                  isSelected ? 'text-white/80' : 'text-[#69708A]'
                }`}>
                  {dayName}
                </span>
                <span className={`text-xs font-extrabold font-display leading-none mt-0.5 ${
                  isSelected ? 'text-white' : 'text-[#0E1730]'
                }`}>
                  {dayNum}
                </span>
                {isToday && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-[#2F5CFF] absolute bottom-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Hero Card - Próxima Tarefa Relevante */}
      <section className="mt-3 mb-6">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs">🔥</span>
          <h2 className="text-[11px] md:text-xs font-bold text-[#FF8A24] uppercase tracking-wider font-display">
            PRÓXIMA TAREFA RELEVANTE
          </h2>
        </div>

        {nextRelevantTask ? (
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.995 }}
            onClick={() => handleToggleTask(nextRelevantTask.id)}
            className="group flex items-center gap-4 bg-gradient-to-br from-[#1E3FD6] to-[#0B1440] min-h-[90px] py-3 px-4 rounded-[22px] cursor-pointer transition-all shadow-md relative overflow-hidden text-white"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleTask(nextRelevantTask.id);
              }}
              className="shrink-0 flex items-center justify-center w-10 h-10 cursor-pointer"
            >
              <div className="w-6 h-6 flex items-center justify-center rounded-full border-[2px] border-white/40 text-transparent hover:border-white bg-white/10 transition-all duration-200">
                {nextRelevantTask.completed && <Check size={14} strokeWidth={3} className="text-white" />}
              </div>
            </button>

            <div className="flex flex-col flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-bold text-white font-display truncate">
                {formatTaskTitle(nextRelevantTask, selectedDate)}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[11px] md:text-xs text-white/95 font-medium bg-white/10 px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shrink-0">
                  <Clock size={11} className="text-[#FF8A24]" />
                  {nextRelevantTask.time}
                </span>
                <span className="text-[11px] md:text-xs text-white/95 font-medium bg-white/10 px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shrink-0">
                  <Tag size={11} className="text-white/70" />
                  {nextRelevantTask.category}
                </span>
                {nextRelevantTask.repeatDays && (
                  <span className="text-[11px] text-white/80 font-medium bg-white/10 px-2.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                    <Repeat size={10} className="text-white/70" />
                    {nextRelevantTask.repeatDays}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center gap-2 bg-white/80 border border-[#E3E8F1] p-5 rounded-[22px] text-[#69708A] font-medium text-sm">
            <Sparkles size={18} className="text-[#10B981]" />
            <span>Nenhuma tarefa pendente para esta data!</span>
          </div>
        )}
      </section>

      {/* Section Header: Tarefas & Controls */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-[#0E1730] font-display">
              Tarefas
            </h2>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#2F5CFF]/10 text-[#2F5CFF] text-xs font-bold font-display">
              {filteredTasks.length}
            </span>
          </div>

          <button
            onClick={() => {
              setTaskToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2F5CFF] hover:bg-[#1E3FD6] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer font-display"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Nova Tarefa</span>
          </button>
        </div>

        {/* Period Segmented Filter Bar */}
        <div className="grid grid-cols-3 p-1 bg-white border border-[#E3E8F1] rounded-2xl">
          {[
            { id: 'hoje', label: 'Hoje' },
            { id: 'semana', label: 'Semana' },
            { id: 'mes', label: 'Mês' }
          ].map(({ id, label }) => {
            const isActive = activePeriod === id;
            return (
              <button
                key={id}
                onClick={() => setActivePeriod(id as any)}
                className={`py-2 rounded-xl text-xs font-bold font-display transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0E1730] text-white shadow-xs'
                    : 'text-[#69708A] hover:text-[#0E1730]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Tasks List */}
        <div className="space-y-3 mt-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-white border border-[#E3E8F1] rounded-[20px] p-8 text-center space-y-2">
              <Calendar size={32} className="mx-auto text-[#9AA1B8]" />
              <p className="text-sm font-semibold text-[#0E1730]">Nenhuma tarefa encontrada para esta data</p>
              <p className="text-xs text-[#69708A]">Clique em "+ Nova Tarefa" para adicionar.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isCompleted = task.completed;
              const categoryColor = getCategoryColor(task.category);
              const displayTitle = formatTaskTitle(task, selectedDate);

              return (
                <div
                  key={task.id}
                  onClick={() => {
                    setTaskToEdit(task);
                    setIsModalOpen(true);
                  }}
                  className={`relative z-10 group flex items-center gap-3.5 p-3.5 md:p-4 rounded-[16px] border cursor-pointer transition-all shadow-xs pl-6 ${
                    task.priority && !isCompleted
                      ? 'bg-[#FF8A24]/10 border-[#FF8A24]/30 hover:border-[#FF8A24]/50'
                      : 'bg-white border-[#E3E8F1] hover:border-[#2F5CFF]/30'
                  }`}
                >
                  {/* Category Color Indicator */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-[16px]"
                    style={{ backgroundColor: categoryColor }}
                  />

                  {/* Checkbox Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleTask(task.id);
                    }}
                    className="shrink-0 flex items-center justify-center w-9 h-9 cursor-pointer"
                  >
                    <div
                      className={`w-5 h-5 flex items-center justify-center rounded-[6px] border-[2px] transition-all duration-200 ${
                        isCompleted
                          ? 'bg-[#16A34A] border-[#16A34A] text-white scale-105'
                          : 'border-[#9AA1B8] text-transparent hover:border-[#2F5CFF] bg-[#F3F5FA]'
                      }`}
                    >
                      {isCompleted && <Check size={12} strokeWidth={4} className="text-white" />}
                    </div>
                  </button>

                  {/* Main Details */}
                  <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${isCompleted ? 'opacity-40' : 'opacity-100'}`}>
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm md:text-base font-semibold text-[#0E1730] truncate font-display ${
                          isCompleted ? 'line-through decoration-[#0E1730]/30 text-[#69708A]' : ''
                        }`}
                      >
                        {displayTitle}
                      </h3>
                      {task.priority && !isCompleted && (
                        <span className="text-[10px] text-[#FF8A24] bg-[#FF8A24]/15 px-1.5 py-0.5 rounded-md font-bold shrink-0">
                          Prioridade
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[11px] text-[#69708A] font-medium flex items-center gap-1 shrink-0">
                        <Clock size={11} className="text-[#9AA1B8]" />
                        {task.time}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[#E3E8F1] shrink-0" />
                      <span className="text-[11px] text-[#69708A] font-medium flex items-center gap-1 shrink-0">
                        <Tag size={11} className="text-[#9AA1B8]" />
                        {task.category}
                      </span>
                      {task.repeatDays && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-[#E3E8F1] shrink-0" />
                          <span className="text-[11px] text-[#69708A] font-medium flex items-center gap-1 shrink-0">
                            <Repeat size={11} className="text-[#9AA1B8]" />
                            {task.repeatDays}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Icon or Edit Action */}
                  <div className="shrink-0 flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#F3F5FA] text-[#69708A] group-hover:text-[#2F5CFF] transition-colors">
                      {renderTaskIcon(task)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveModal}
        onDelete={handleDeleteTask}
        taskToEdit={taskToEdit}
        initialDate={selectedDateISO}
      />
    </div>
  );
};
