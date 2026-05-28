import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Dumbbell, 
  TrendingUp, 
  UserPlus,
  LogOut,
  Flame,
  ChevronLeft,
  Save
} from 'lucide-react';
import { useStore } from '../../store';
import { User, WorkoutRoutine, Exercise } from '../../types';
import { exerciseDatabase, BaseExercise } from '../../data/exerciseDatabase';

// Sub-components
import { StudentsTab } from './teacher/StudentsTab';
import { EvolutionTab } from './teacher/EvolutionTab';
import { ExerciseLibrary } from './teacher/ExerciseLibrary';
import { WorkoutWorkspace } from './teacher/WorkoutWorkspace';
import { StudentModals } from './teacher/StudentModals';

export const TeacherView: React.FC = () => {
  const { user, allWorkouts, setAllWorkouts, addToast, logout } = useStore();
  
  // Active Tab: 'alunos', 'construtor' or 'evolucao'
  const [activeTab, setActiveTab] = useState<'alunos' | 'construtor' | 'evolucao'>('alunos');
  
  // Selected Student for Workout Constructor or History Views
  const [selectedStudentUsername, setSelectedStudentUsername] = useState<string | null>(null);

  // Division Auto-collapse state
  const [isDivisionSet, setIsDivisionSet] = useState<boolean>(true);

  // Add Student modal trigger
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    username: '',
    name: '',
    password: '12345',
    sex: 'masculino' as 'masculino' | 'feminino',
  });

  // Edit Student modal trigger
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [editStudentData, setEditStudentData] = useState({
    username: '',
    name: '',
    password: '',
    sex: 'masculino' as 'masculino' | 'feminino'
  });

  // Local state directory and sync trigger
  const [trigger, setTrigger] = useState(0);
  const [students, setStudents] = useState<User[]>([]);

  // Selected Division Frequency (AB, ABC, ABCD, ABCDE)
  const [sheetFrequency, setSheetFrequency] = useState<'AB' | 'ABC' | 'ABCD' | 'ABCDE'>('ABC');

  // Local storage workouts during generation
  const [localRoutines, setLocalRoutines] = useState<WorkoutRoutine[]>([]);
  const [activeRoutineIdx, setActiveRoutineIdx] = useState<number>(0);

  // UI state query and accordion selection
  const [searchExerciseQuery, setSearchExerciseQuery] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('Todos');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  // Highlight effect helper for recently added exercises to visually verify where it goes
  const [recentAddedId, setRecentAddedId] = useState<string | null>(null);

  // Security Gate for Docente profile 'teste3'
  if (!user || user.username.toLowerCase() !== 'teste3') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400 p-6 text-center font-sans">
        <div className="bg-zinc-900/60 border border-zinc-900 p-8 rounded-xl max-w-sm shrink-0">
          <span className="text-zinc-500 font-medium text-xs block mb-1">Acesso restrito</span>
          <p className="text-xs leading-relaxed text-zinc-400 mb-6">Esta interface administrativa é exclusiva para o Docente Credenciado (Prof. Teste3).</p>
          <button 
            onClick={logout} 
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer"
          >
            Sair da conta
          </button>
        </div>
      </div>
    );
  }

  // Load students data directory from local registry
  useEffect(() => {
    const list: User[] = [];
    const defaults = ['teste', 'teste2'];
    
    defaults.forEach(uname => {
      const saved = localStorage.getItem(`tatugym_user_profile_${uname}`);
      if (saved) {
        try {
          list.push(JSON.parse(saved));
        } catch {
          // ignore cache error
        }
      } else {
        list.push({
          username: uname,
          name: uname === 'teste' ? 'Teste Masculino' : 'Teste Feminino',
          role: 'student',
          sex: uname === 'teste2' ? 'feminino' : 'masculino',
          streak: 0,
          totalWorkouts: 0,
          checkIns: [],
          history: [],
          isProfileComplete: true
        });
      }
    });

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tatugym_user_profile_')) {
        const username = key.replace('tatugym_user_profile_', '');
        if (username !== 'teste' && username !== 'teste2' && username !== 'teste3') {
          try {
            const profileData = JSON.parse(localStorage.getItem(key) || '');
            if (profileData && profileData.role === 'student' && !list.some(s => s.username === username)) {
              list.push(profileData);
            }
          } catch {
            // ignore JSON error
          }
        }
      }
    }

    setStudents(list);
  }, [allWorkouts, trigger]);

  // Sync builder routines whenever active student context is switched
  useEffect(() => {
    if (selectedStudentUsername) {
      const lower = selectedStudentUsername.toLowerCase();
      const existing = allWorkouts[lower] || [];
      
      // Auto deduce sheet division setting
      if (existing.length <= 2) {
        setSheetFrequency('AB');
      } else if (existing.length === 3) {
        setSheetFrequency('ABC');
      } else if (existing.length === 4) {
        setSheetFrequency('ABCD');
      } else {
        setSheetFrequency('ABCDE');
      }

      // Prepopulate slots A-E
      const initialRoutines: WorkoutRoutine[] = Array.from({ length: 5 }).map((_, idx) => {
        const char = String.fromCharCode(65 + idx);
        const matched = existing[idx];
        return matched ? { ...matched } : {
          id: `routine_${char}_${Math.random().toString(36).substring(2, 9)}`,
          title: `Treino ${char}`,
          description: '',
          exercises: [],
          color: 'blue'
        };
      });

      setLocalRoutines(initialRoutines);
      setActiveRoutineIdx(0);
      setIsDivisionSet(true);
    }
  }, [selectedStudentUsername]);

  // Add new student integration
  const handleCreateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = newStudentData.username.trim().toLowerCase();
    const cleanName = newStudentData.name.trim();

    if (!cleanUser || !cleanName) {
      if (addToast) addToast("Preencha todos os campos obrigatórios.", "error");
      return;
    }

    const isConflict = students.some(s => s.username.toLowerCase() === cleanUser) || cleanUser === 'teste3';
    if (isConflict) {
      if (addToast) addToast("Este nome de usuário já está sendo utilizado.", "error");
      return;
    }

    const newStudent: User = {
      username: cleanUser,
      name: cleanName,
      password: newStudentData.password,
      sex: newStudentData.sex,
      role: 'student',
      streak: 0,
      totalWorkouts: 0,
      checkIns: [],
      history: [],
      weights: {},
      isProfileComplete: true
    };

    localStorage.setItem(`tatugym_user_profile_${cleanUser}`, JSON.stringify(newStudent));
    setNewStudentData({
      username: '',
      name: '',
      password: '12345',
      sex: 'masculino',
    });
    setShowAddModal(false);
    setTrigger(prev => prev + 1);
    if (addToast) addToast(`Aluno ${cleanName} cadastrado com sucesso!`, "success");
  };

  // Open Edit student Modal
  const handleOpenEditModal = (student: User) => {
    setEditingStudent(student);
    setEditStudentData({
      username: student.username,
      name: student.name,
      password: student.password || '12345',
      sex: student.sex || 'masculino'
    });
  };

  // Saved Edit student
  const handleEditStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const savedKey = `tatugym_user_profile_${editingStudent.username}`;
    const updatedUser: User = {
      ...editingStudent,
      name: editStudentData.name,
      password: editStudentData.password,
      sex: editStudentData.sex,
    };

    localStorage.setItem(savedKey, JSON.stringify(updatedUser));
    setEditingStudent(null);
    setTrigger(prev => prev + 1);
    if (addToast) addToast("Cadastro do aluno atualizado!", "success");
  };

  // Delete individual student records
  const handleDeleteStudent = (username: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm(`Tem certeza que deseja excluir sumariamente o aluno @${username}?`)) {
      return;
    }

    localStorage.removeItem(`tatugym_user_profile_${username}`);
    
    // Clear workouts
    const currentAll = { ...allWorkouts };
    delete currentAll[username.toLowerCase()];
    setAllWorkouts(currentAll);

    // Notify state
    setEditingStudent(null);
    if (selectedStudentUsername === username) {
      setSelectedStudentUsername(null);
    }
    setTrigger(prev => prev + 1);
    if (addToast) addToast(`Aluno @${username} deletado do banco de dados.`, "success");
  };

  // Append exercise inside active training sheet
  const handleAddNewExercise = (baseEx: BaseExercise) => {
    const updated = [...localRoutines];
    const routine = { ...updated[activeRoutineIdx] };
    if (!routine) return;

    // Build specific structure targeting active layout row
    const exerciseID = `ex_${Math.random().toString(36).substring(2, 9)}`;
    const newEx: Exercise = {
      id: exerciseID,
      name: baseEx.name,
      muscleGroup: baseEx.muscleGroup,
      sets: baseEx.defaultSets || 3,
      reps: baseEx.defaultReps || '10-12',
      rest: baseEx.defaultRest || 60,
      notes: '0',
      dropSet: false,
      restPause: false,
      biSet: false,
      cluster: false,
      isometria: false,
      falha: false
    };

    routine.exercises = [...(routine.exercises || []), newEx];
    updated[activeRoutineIdx] = routine;
    setLocalRoutines(updated);
    setExpandedExerciseId(exerciseID);

    // Dynamic added visual checklist flash effect
    setRecentAddedId(baseEx.name);
    setTimeout(() => {
      setRecentAddedId(null);
    }, 800);

    if (addToast) addToast(`"${baseEx.name}" incluído no Treino ${String.fromCharCode(65 + activeRoutineIdx)}`, "success");
  };

  // Append flexible customized exercise card at bottom request button
  const handleAddCustomExercise = () => {
    const updated = [...localRoutines];
    const routine = { ...updated[activeRoutineIdx] };
    if (!routine) return;

    const exerciseID = `ex_${Math.random().toString(36).substring(2, 9)}`;
    const newEx: Exercise = {
      id: exerciseID,
      name: 'Exercício Personalizado',
      muscleGroup: 'Livre',
      sets: 4,
      reps: '10',
      rest: 60,
      notes: '0',
      dropSet: false,
      restPause: false,
      biSet: false
    };

    routine.exercises = [...(routine.exercises || []), newEx];
    updated[activeRoutineIdx] = routine;
    setLocalRoutines(updated);
    setExpandedExerciseId(exerciseID);

    if (addToast) addToast("Exercício livre adicionado ao construtor!", "success");
  };

  // Handle configuration updates
  const handleUpdateExerciseField = (id: string, field: keyof Exercise, val: any) => {
    const updated = [...localRoutines];
    const routine = { ...updated[activeRoutineIdx] };
    if (!routine) return;

    routine.exercises = (routine.exercises || []).map(ex => {
      if (ex.id === id) {
        return { ...ex, [field]: val };
      }
      return ex;
    });

    updated[activeRoutineIdx] = routine;
    setLocalRoutines(updated);
  };

  // Remove exercise from routine
  const handleRemoveExercise = (id: string) => {
    const updated = [...localRoutines];
    const routine = { ...updated[activeRoutineIdx] };
    if (!routine) return;

    routine.exercises = (routine.exercises || []).map(ex => {
      // Clean target load metas in profile weights block if matching specific IDs to prevent ghost entries
      if (ex.id === id && selectedStudentUsername) {
        const studentProfileKey = `tatugym_user_profile_${selectedStudentUsername.toLowerCase()}`;
        const cached = localStorage.getItem(studentProfileKey);
        if (cached) {
          try {
            const p = JSON.parse(cached);
            if (p.weights && p.weights[ex.name]) {
              delete p.weights[ex.name];
              localStorage.setItem(studentProfileKey, JSON.stringify(p));
            }
          } catch {
            // ignore
          }
        }
      }
      return ex;
    }).filter(ex => ex.id !== id);

    updated[activeRoutineIdx] = routine;
    setLocalRoutines(updated);
    if (expandedExerciseId === id) setExpandedExerciseId(null);
    if (addToast) addToast("Exercício removido da planilha.", "success");
  };

  // Continuously auto-saves any changes to workouts in real-time
  useEffect(() => {
    if (!selectedStudentUsername || localRoutines.length === 0) return;

    const lowerStr = selectedStudentUsername.toLowerCase();
    const limit = getFrequencyCount();
    const activeRoutines = localRoutines.slice(0, limit);

    const payload = {
      ...allWorkouts,
      [lowerStr]: activeRoutines,
    };

    setAllWorkouts(payload);
    localStorage.setItem('tatugym_all_workouts', JSON.stringify(payload));
  }, [localRoutines, sheetFrequency, selectedStudentUsername]);

  // Inject a block template of exercises with default presets instantly
  const handleInjectBlock = (exercisesList: BaseExercise[]) => {
    const updated = [...localRoutines];
    const routine = { ...updated[activeRoutineIdx] };
    if (!routine) return;

    const newExs: Exercise[] = exercisesList.map(baseEx => {
      const exerciseID = `ex_${Math.random().toString(36).substring(2, 9)}`;
      return {
        id: exerciseID,
        name: baseEx.name,
        muscleGroup: baseEx.muscleGroup,
        sets: baseEx.defaultSets || 3,
        reps: baseEx.defaultReps || '10-12',
        rest: baseEx.defaultRest || 60,
        notes: '0',
        dropSet: false,
        restPause: false,
        biSet: false,
        cluster: false,
        isometria: false,
        falha: false
      };
    });

    routine.exercises = [...(routine.exercises || []), ...newExs];
    updated[activeRoutineIdx] = routine;
    setLocalRoutines(updated);
    
    if (addToast) addToast(`Injetado bloco de ${exercisesList.length} exercícios com presets!`, "success");
  };

  // Clones exercises from another training slot (e.g. A to B)
  const handleCloneRoutine = (fromIdx: number) => {
    if (fromIdx < 0 || fromIdx >= localRoutines.length) return;
    const source = localRoutines[fromIdx];
    if (!source) return;

    const updated = [...localRoutines];
    const clonedExercises: Exercise[] = (source.exercises || []).map(ex => ({
      ...ex,
      id: `ex_${Math.random().toString(36).substring(2, 9)}`
    }));

    updated[activeRoutineIdx] = {
      ...updated[activeRoutineIdx],
      exercises: clonedExercises,
      title: source.title || updated[activeRoutineIdx].title
    };

    setLocalRoutines(updated);
    if (addToast) addToast(`Copiado estrutura do Treino ${String.fromCharCode(65 + fromIdx)} para este treino!`, "success");
  };

  // Clones entire sheet from another student
  const handleCloneFromOtherStudent = (otherStudentUsername: string) => {
    const existing = allWorkouts[otherStudentUsername.toLowerCase()] || [];
    if (existing.length === 0) {
      if (addToast) addToast(`O aluno @${otherStudentUsername} ainda não possui treinos cadastrados.`, "error");
      return;
    }

    const clonedRoutines = existing.map(routine => ({
      ...routine,
      id: `routine_${Math.random().toString(36).substring(2, 9)}`,
      exercises: (routine.exercises || []).map(ex => ({
        ...ex,
        id: `ex_${Math.random().toString(36).substring(2, 9)}`
      }))
    }));

    const initialRoutines: WorkoutRoutine[] = Array.from({ length: 5 }).map((_, idx) => {
      const char = String.fromCharCode(65 + idx);
      const matched = clonedRoutines[idx];
      return matched ? { ...matched } : {
        id: `routine_${char}_${Math.random().toString(36).substring(2, 9)}`,
        title: `Treino ${char}`,
        description: '',
        exercises: [],
        color: 'blue'
      };
    });

    setLocalRoutines(initialRoutines);
    if (addToast) addToast(`Treinos clonados com sucesso do aluno @${otherStudentUsername}!`, "success");
  };

  // Wipe current routine exercises
  const handleClearWorkoutRoutine = () => {
    const updated = [...localRoutines];
    if (updated[activeRoutineIdx]) {
      updated[activeRoutineIdx].exercises = [];
      setLocalRoutines(updated);
      if (addToast) addToast("Todos os exercícios foram removidos deste treino.", "success");
    }
  };

  // Fast forward to builder
  const handleManageStudent = (username: string) => {
    setSelectedStudentUsername(username);
    setActiveTab('construtor');
  };

  // Helper limits
  const getFrequencyCount = () => {
    switch (sheetFrequency) {
      case 'AB': return 2;
      case 'ABC': return 3;
      case 'ABCD': return 4;
      case 'ABCDE': return 5;
      default: return 3;
    }
  };

  // Filter recommendations database list
  const filteredSuggestions = exerciseDatabase.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchExerciseQuery.toLowerCase()) || 
                          item.muscleGroup.toLowerCase().includes(searchExerciseQuery.toLowerCase());
    
    if (selectedMuscleFilter === 'Todos') return matchesSearch;
    
    if (selectedMuscleFilter === 'Braços') {
      return matchesSearch && ['Bíceps', 'Tríceps', 'Antebraço'].includes(item.muscleGroup);
    }
    if (selectedMuscleFilter === 'Pernas') {
      return matchesSearch && ['Quadríceps', 'Isquiotibiais', 'Panturrilha', 'Perna', 'Coxa', 'Glúteos'].includes(item.muscleGroup);
    }
    
    return matchesSearch && item.muscleGroup.toLowerCase().includes(selectedMuscleFilter.toLowerCase().slice(0, 4));
  });

  const selectedStudentProfile = students.find(s => s.username === selectedStudentUsername);

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-200 flex flex-col lg:flex-row font-sans lg:overflow-hidden pb-safe-bottom w-full">
      
      {/* 1. DESKTOP PERMANENT GLOBAL SIDEBAR - Elegant and fine (Notion / Figma / Linear inspiration) */}
      <aside className="hidden lg:flex flex-col w-[260px] h-screen bg-[#0F1014] border-r border-white/[0.015] p-6 shrink-0 justify-between select-none">
        <div className="space-y-8">
          
          {/* Brand header */}
          <div className="flex items-center gap-3">
            <span className="font-black text-xl tracking-wider text-white uppercase italic">
              HORUS<span className="text-zinc-650 font-normal">/</span>FIT
            </span>
          </div>

          {/* Quick modules menu list */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest pl-1 mb-1">
              Painel do Docente
            </span>
            {[
              { id: 'alunos', label: 'Meus alunos', icon: Users },
              { id: 'construtor', label: 'Construtor', icon: Dumbbell },
              { id: 'evolucao', label: 'Evolução', icon: TrendingUp },
            ].map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === 'construtor' && !selectedStudentUsername) {
                      const first = students[0]?.username || null;
                      if (first) setSelectedStudentUsername(first);
                    }
                    setActiveTab(item.id as any);
                  }}
                  className={`flex items-center gap-3.5 w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer border ${
                    isActive 
                      ? 'bg-[#171A20] border-white/[0.04] text-white font-extrabold shadow-sm' 
                      : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-[#171A20]/25'
                  }`}
                >
                  <item.icon size={14} className={isActive ? 'text-white' : 'text-zinc-500'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* User profile action section */}
        <div className="space-y-4 pt-6 border-t border-white/[0.015]">
          <div className="flex flex-col rounded-xl bg-[#111318] border border-white/[0.015] p-3.5 font-sans">
            <span className="text-sm font-extrabold text-zinc-200">Prof. Teste3</span>
            <span className="text-[9px] font-mono font-black uppercase text-zinc-500 mt-1 tracking-wider">Docente Credenciado</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-1.5 py-3.5 w-full bg-zinc-100 hover:bg-white text-[#09090B] text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <UserPlus size={13} />
            <span>Novo Aluno</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full py-3 bg-[#111318]/50 hover:bg-[#171A20] text-zinc-400 hover:text-zinc-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-white/[0.01]"
          >
            <LogOut size={12} />
            <span>Desconectar</span>
          </button>
        </div>
      </aside>

      {/* 2. MOBILE TOP NAV (Visible only on small viewports) */}
      <div className="flex lg:hidden flex-col w-full shrink-0 select-none">
        <header className="flex flex-col justify-between py-4 px-4 border-b border-white/[0.015] gap-4 shrink-0 bg-[#0F1014]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white tracking-tight uppercase">HORUS <span className="text-zinc-400 font-black">TRAINING</span></span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="py-1.5 px-3 bg-zinc-100 hover:bg-white text-[#09090B] text-[11px] font-black uppercase rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                + Aluno
              </button>
              <button
                type="button"
                onClick={logout}
                className="text-zinc-400 hover:text-zinc-200 bg-[#111318] py-1.5 px-2 rounded-lg text-xs cursor-pointer border border-white/[0.01]"
              >
                <LogOut size={12} />
              </button>
            </div>
          </div>

          {/* Quick Switch segment picker */}
          <div className="flex items-center gap-0.5 bg-[#111318] p-1 rounded-xl border border-white/[0.015]">
            {[
              { id: 'alunos', label: 'Alunado', icon: Users },
              { id: 'construtor', label: 'Ficha', icon: Dumbbell },
              { id: 'evolucao', label: 'Evolução', icon: TrendingUp },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'construtor' && !selectedStudentUsername) {
                    const first = students[0]?.username || null;
                    if (first) setSelectedStudentUsername(first);
                  }
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center justify-center gap-1.5 flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#171A20] text-white font-extrabold shadow'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <tab.icon size={12} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </header>
      </div>

      {/* 3. RIGHT MASTER VIEWPORT CONTAINER - Spans 100% of the layout frame */}
      <div className="flex-1 flex flex-col min-h-0 lg:h-screen lg:overflow-hidden bg-transparent">
        
        <main className="flex-grow flex flex-col min-h-0 lg:overflow-hidden h-auto lg:h-full">
          
          {/* TAB 1: MEUS ALUNOS (Students directory list view) */}
          {activeTab === 'alunos' && (
            <div className="flex-grow flex flex-col min-h-0 h-full overflow-y-auto p-4 md:p-8 xl:p-10">
              <StudentsTab 
                students={students}
                onOpenEditModal={handleOpenEditModal}
                onManageStudent={handleManageStudent}
              />
            </div>
          )}
 
          {/* TAB 2: CONSTRUTOR DE FICHA (Real Desktop Workspace App Layout) */}
          {activeTab === 'construtor' && (
            <div className="flex flex-col min-h-0 flex-grow lg:overflow-hidden lg:h-full h-auto">
              
              {!selectedStudentUsername ? (
                <div className="flex-grow flex flex-col items-center justify-center p-8 md:p-16 text-center h-full">
                  <div className="border border-zinc-900 border-dashed rounded-2xl p-10 max-w-md w-full bg-zinc-900/10 flex flex-col items-center">
                    <Dumbbell className="text-zinc-650 mb-4 animate-pulse" size={36} />
                    <p className="text-zinc-200 font-bold text-sm tracking-tight">Nenhum Aluno Ativo Selecionado</p>
                    <p className="text-xs text-zinc-500 mt-2 leading-relaxed">Selecione um aluno da sua diretoria para começar a desenhar planilhas, ajustar cargas e criar rotinas de treinamento.</p>
                    <button
                      onClick={() => setActiveTab('alunos')}
                      className="mt-6 py-3 px-8 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Ver Meus Alunos
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col flex-grow min-h-0 lg:h-full lg:overflow-hidden h-auto">
                  
                  {/* DEDICATED SUB-HEADER / ACTIONS STRIP - Spans fluidly above splits */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-6 md:px-8 border-b border-white/[0.015] shrink-0 bg-[#0F1014] select-none">
                    
                    {/* Active target profile badge block */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 bg-[#111318] border border-white/[0.015] px-3.5 py-1.5 rounded-xl select-none">
                        <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider font-mono">Montando para</span>
                        <span className="text-sm text-zinc-100 font-black tracking-tight font-sans">
                          {selectedStudentProfile?.name || selectedStudentUsername}
                        </span>
                      </div>
 
                      {/* Interactive workout frequency sheet layout dropdown */}
                      {isDivisionSet ? (
                        <div className="flex items-center gap-2.5 text-xs py-1.5 px-3.5 rounded-xl bg-[#111318] border border-white/[0.015] shadow-sm select-none">
                          <span className="text-zinc-500 font-bold">Frequência:</span>
                          <span className="text-white font-mono font-black tracking-widest uppercase">
                            {sheetFrequency.split('').join('/')}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsDivisionSet(false)}
                            className="text-zinc-400 hover:text-white underline cursor-pointer hover:no-underline text-xs font-bold transition-colors ml-2"
                          >
                            Alterar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 bg-[#111318] border border-white/[0.015] p-1 px-3.5 rounded-xl select-none">
                          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Fichas:</span>
                          <div className="flex gap-2 select-none">
                            {(['AB', 'ABC', 'ABCD', 'ABCDE'] as const).map((freq) => {
                              const isCurrentFreq = sheetFrequency === freq;
                              return (
                                <button
                                  key={freq}
                                  type="button"
                                  onClick={() => {
                                    setSheetFrequency(freq);
                                    setIsDivisionSet(true);
                                    if (activeRoutineIdx >= freq.length) {
                                      setActiveRoutineIdx(0);
                                    }
                                  }}
                                  className={`px-3 py-1 text-xs font-bold font-mono rounded-lg transition-colors cursor-pointer ${
                                    isCurrentFreq
                                      ? 'bg-[#171A20] text-white border border-white/5 shadow'
                                      : 'bg-transparent text-zinc-500 hover:text-zinc-330'
                                  }`}
                                >
                                  {freq}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
 
                    {/* Auto-saved checklist green flash metric and go back button */}
                    <div className="flex items-center gap-5">
                      <div className="flex items-center gap-2 text-zinc-500 select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold font-sans text-zinc-400 tracking-tight">Sincronizado na nuvem</span>
                      </div>
 
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudentUsername(null);
                          setActiveTab('alunos');
                        }}
                        className="py-2.5 px-4 bg-[#111318] hover:bg-[#171A20] text-xs text-zinc-400 hover:text-zinc-100 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-white/[0.015]"
                      >
                        <ChevronLeft size={14} />
                        <span>Voltar</span>
                      </button>
                    </div>
                  </div>
 
                  {/* FULL-CANVAS SIDE-BY-SIDE INTEGRATION (Zero external borders constraint) */}
                  <div className="flex-grow flex flex-col lg:flex-row gap-0 lg:overflow-hidden min-h-0 w-full lg:h-full h-auto">
                    
                    {/* LEFT COL: EMBEDDED DOCKED EXERCISE LIBRARY PANEL - Exactly 420px */}
                    <aside className="w-full lg:w-[420px] lg:h-full shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-white/[0.015] bg-[#0F1014] h-auto lg:overflow-hidden">
                      <ExerciseLibrary 
                        filteredSuggestions={filteredSuggestions}
                        searchExerciseQuery={searchExerciseQuery}
                        setSearchExerciseQuery={setSearchExerciseQuery}
                        selectedMuscleFilter={selectedMuscleFilter}
                        setSelectedMuscleFilter={setSelectedMuscleFilter}
                        recentAddedId={recentAddedId}
                        onAddExercise={handleAddNewExercise}
                        onInjectBlock={handleInjectBlock}
                      />
                    </aside>
 
                    {/* RIGHT COL: MAIN DOMINANT WORKSPACE (Spans 100% of remaining screen space) */}
                    <section className="flex-grow lg:h-full lg:overflow-hidden flex flex-col bg-[#111318] min-w-0 h-auto">
                      <WorkoutWorkspace 
                        localRoutines={localRoutines}
                        activeRoutineIdx={activeRoutineIdx}
                        setActiveRoutineIdx={setActiveRoutineIdx}
                        expandedExerciseId={expandedExerciseId}
                        setExpandedExerciseId={setExpandedExerciseId}
                        sheetFrequency={sheetFrequency}
                        getFrequencyCount={getFrequencyCount}
                        onUpdateExerciseField={handleUpdateExerciseField}
                        onRemoveExercise={handleRemoveExercise}
                        onAddCustomExercise={handleAddCustomExercise}
                        onUpdateRoutineTitle={(title) => {
                          const updated = [...localRoutines];
                          if (updated[activeRoutineIdx]) {
                            updated[activeRoutineIdx].title = title;
                            setLocalRoutines(updated);
                          }
                        }}
                        students={students}
                        onCloneRoutine={handleCloneRoutine}
                        onCloneFromOtherStudent={handleCloneFromOtherStudent}
                        onClearWorkoutRoutine={handleClearWorkoutRoutine}
                        onInjectBlock={handleInjectBlock}
                      />
                    </section>
                  </div>
 
                </div>
              )}
            </div>
          )}
 
          {/* TAB 3: HISTÓRICO DE PROGRESSÃO */}
          {activeTab === 'evolucao' && (
            <div className="flex-grow flex flex-col min-h-0 h-full overflow-y-auto p-4 md:p-8 xl:p-10">
              <EvolutionTab 
                selectedStudentUsername={selectedStudentUsername}
                selectedStudentProfile={selectedStudentProfile}
                onTabChange={setActiveTab}
              />
            </div>
          )}
 
        </main>
      </div>
 
      {/* GLOBAL MODALS */}
      <StudentModals 
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        newStudentData={newStudentData}
        setNewStudentData={setNewStudentData}
        onCreateStudentSubmit={handleCreateStudentSubmit}
        editingStudent={editingStudent}
        setEditingStudent={setEditingStudent}
        editStudentData={editStudentData}
        setEditStudentData={setEditStudentData}
        onEditStudentSubmit={handleEditStudentSubmit}
        onDeleteStudent={handleDeleteStudent}
      />
 
    </div>
  );
};
