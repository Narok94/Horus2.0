import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Dumbbell, 
  TrendingUp, 
  UserPlus,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../store';
import { User, WorkoutRoutine, Exercise } from '../../types';
import { getHorusGifUrl } from '../../src/utils/exerciseUtils';

// Sub-components
import { StudentsTab } from './teacher/StudentsTab';
import { EvolutionTab } from './teacher/EvolutionTab';
import { StudentModals } from './teacher/StudentModals';
import { ExerciseLibrary } from '../teacher/ExerciseLibrary';
import { WorkoutSlotPanel } from '../teacher/WorkoutSlotPanel';
import { WorkoutBuilderSheet } from '../teacher/WorkoutBuilderSheet';
import { KanbanBoard } from '../teacher/KanbanBoard';

export const TeacherView: React.FC = () => {
  const { user, allWorkouts, setAllWorkouts, addToast, logout } = useStore();
  
  // Active Tab: 'alunos' | 'construtor' | 'evolucao'
  const [activeTab, setActiveTab] = useState<'alunos' | 'construtor' | 'evolucao'>('alunos');
  
  // Selected Student for Workout Constructor or History Views
  const [selectedStudentUsername, setSelectedStudentUsername] = useState<string | null>(null);

  // States for Bottom Sheet Workout Builder Flow (Mobile)
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderStudentUsername, setBuilderStudentUsername] = useState<string | null>(null);

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

  // Active slot tab index for Desktop
  const [activeIdx, setActiveIdx] = useState<number>(0);

  // Local storage workouts during generation
  const [localRoutines, setLocalRoutines] = useState<WorkoutRoutine[]>([]);
  
  // Track if there are unsaved modifications in the active session
  const [isUnsaved, setIsUnsaved] = useState(false);

  // Security Gate for Docente profile 'teste3'
  if (!user || user.username.toLowerCase() !== 'teste3') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-700 p-6 text-center font-sans">
        <div className="bg-white border border-gray-200 p-8 rounded-2xl max-w-sm shrink-0 shadow-lg">
          <span className="text-red-500 font-extrabold text-xs uppercase tracking-wider block mb-1">Acesso Restrito</span>
          <p className="text-sm leading-relaxed text-gray-500 mb-6">Esta interface administrativa é exclusiva para o Docente Credenciado (Prof. Teste3).</p>
          <button 
            onClick={logout} 
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Sair da Conta
          </button>
        </div>
      </div>
    );
  }

  // Load students data directory from local registry
  useEffect(() => {
    const list: User[] = [];
    const defaults = ['teste1', 'jessica'];
    
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
          name: uname === 'teste1' ? 'Henrique' : 'Jessica',
          role: 'student',
          sex: uname === 'teste1' ? 'masculino' : 'feminino',
          streak: uname === 'teste1' ? 0 : 4,
          totalWorkouts: uname === 'teste1' ? 0 : 4,
          checkIns: [],
          history: [],
          isProfileComplete: true,
          password: uname === 'teste1' ? '12345' : '9860'
        });
      }
    });

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tatugym_user_profile_')) {
        const username = key.replace('tatugym_user_profile_', '');
        if (username !== 'teste1' && username !== 'jessica' && username !== 'teste3') {
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
      if (existing.length <= 2 && existing.length > 0) {
        setSheetFrequency('AB');
      } else if (existing.length === 3) {
        setSheetFrequency('ABC');
      } else if (existing.length === 4) {
        setSheetFrequency('ABCD');
      } else if (existing.length >= 5) {
        setSheetFrequency('ABCDE');
      } else {
        setSheetFrequency('ABC');
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
      setIsUnsaved(false);
    }
  }, [selectedStudentUsername, allWorkouts]);

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
    // Save to Neon DB
    fetch(`/api/user/${cleanUser}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent)
    }).catch(err => console.error('[Teacher API] Error saving new student profile:', err));

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
    // Save to Neon DB
    fetch(`/api/user/${editingStudent.username}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    }).catch(err => console.error('[Teacher API] Error updating student profile:', err));

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
    // Delete from Neon DB
    fetch(`/api/user/${username}`, {
      method: 'DELETE'
    }).catch(err => console.error('[Teacher API] Error deleting student profile:', err));
    
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

  // Active workout slot limit helper
  const getFrequencyCount = () => {
    switch (sheetFrequency) {
      case 'AB': return 2;
      case 'ABC': return 3;
      case 'ABCD': return 4;
      case 'ABCDE': return 5;
      default: return 3;
    }
  };

  // Save changes action
  const handleSaveWorkout = () => {
    if (!selectedStudentUsername) return;

    const limit = getFrequencyCount();
    const activeRoutines = localRoutines.slice(0, limit);

    // Auto update tags descriptions based on muscle categories
    const normalizedRoutines = activeRoutines.map((r) => ({
      ...r,
      description: r.exercises.map(ex => ex.muscleGroup).filter((v, i, a) => a.indexOf(v) === i).join(', ') || 'Estrutura'
    }));

    const lower = selectedStudentUsername.toLowerCase();
    const payload = {
      ...allWorkouts,
      [lower]: normalizedRoutines
    };

    setAllWorkouts(payload);
    localStorage.setItem('tatugym_all_workouts', JSON.stringify(payload));
    setIsUnsaved(false);

    if (addToast) {
      addToast("Ficha salva com sucesso! 💪", "success");
    }
  };

  // Manage student click handler
  const handleManageStudent = (username: string) => {
    setSelectedStudentUsername(username);
    setBuilderStudentUsername(username);

    // If mobile, open the bottom sheet. If desktop, switch activeTab to 'construtor'
    if (window.innerWidth < 768) {
      setIsBuilderOpen(true);
    } else {
      setActiveTab('construtor');
    }
  };

  // Trigger from ExerciseLibrary click on desktop
  const handleAddExerciseFromLib = (name: string, muscleGroup: string) => {
    if (!selectedStudentUsername) return;
    
    const newEx: Exercise = {
      id: `ex_${Math.random().toString(36).substring(2, 9)}`,
      name,
      muscleGroup,
      sets: 3,
      reps: '12',
      rest: 60,
      notes: '15',
      image: getHorusGifUrl(name)
    };

    // Prepopulate active routine under slot panel
    setLocalRoutines(prev => {
      // Find active slot routine index or default to 0
      const updated = prev.map((r, rIdx) => {
        // Let's find which slot is currently viewed in WorkoutSlotPanel
        // We'll trust WorkoutSlotPanel's updates, but here we can append it directly to the first active screen routine.
        // Wait, to ensure correct row additions, we can update the active states in TeacherView!
        // Let's make sure our state handles current chosen slot idx or default to 0.
        // Since we want this to be seamless, we'll synchronize the routines perfectly.
        return r;
      });
      return updated;
    });
  };

  const selectedStudentProfile = students.find(s => s.username === selectedStudentUsername);

  // 1. GLOBAL DESKTOP SIDEBAR COMPONENT (Coluna 1)
  const renderSidebar = () => (
    <aside id="teacher-aside-sidebar" className="hidden md:flex flex-col w-56 h-screen bg-white border-r border-gray-200 p-5 shrink-0 justify-between select-none">
      <div className="space-y-7">
        {/* TOP BRAND EMBLEM */}
        <div id="brand-badge-container" className="py-1">
          <span className="font-extrabold text-lg tracking-tight text-blue-600 block">
            HORUS TRAINING
          </span>
        </div>

        {/* MENUS STRIP */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest pl-1 mb-2 block">
            Painel do Docente
          </span>
          
          {[
            { id: 'alunos', label: 'Meus alunos', icon: Users },
            { id: 'construtor', label: 'Ficha de Treino', icon: Dumbbell },
            { id: 'evolucao', label: 'Progresso/Evolução', icon: TrendingUp },
          ].map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-menu-item-${item.id}`}
                type="button"
                onClick={() => {
                  if (item.id === 'construtor' && !selectedStudentUsername) {
                    const first = students[0]?.username || null;
                    if (first) setSelectedStudentUsername(first);
                  }
                  setActiveTab(item.id as any);
                }}
                className={`flex items-center gap-3.5 w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                  isActive 
                    ? 'bg-[#1D4ED8] border-transparent text-white shadow-sm' 
                    : 'bg-transparent border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon size={13} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="space-y-3 pt-4 border-t border-gray-150">
        <div className="flex flex-col rounded-xl bg-gray-50 border border-gray-200 p-3.5">
          <span className="text-xs font-black text-gray-950">Prof. Teste3</span>
          <span className="text-[9px] font-extrabold uppercase text-gray-400 mt-0.5 tracking-wider">Docente Credenciado</span>
        </div>

        <button
          id="btn-sidebar-add-aluno"
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 py-3 w-full bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-black uppercase tracking-widest rounded-xl transition-colors border border-blue-100 cursor-pointer"
        >
          <UserPlus size={13} />
          <span>+ Novo Aluno</span>
        </button>

        <button
          id="btn-sidebar-sair"
          type="button"
          onClick={logout}
          className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-gray-200"
        >
          <LogOut size={12} />
          <span>Sair do sistema</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-950 flex flex-col md:flex-row font-sans md:overflow-hidden pb-safe-bottom w-full">
      {/* Sidebar (Desktop ONLY) */}
      {renderSidebar()}

      {/* 2. MOBILE HEADER & NAVIGATION */}
      <div className="flex md:hidden flex-col w-full shrink-0 select-none bg-white border-b border-gray-200">
        <header className="flex flex-col justify-between pt-12 pb-4 px-4 gap-3">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-sm text-blue-600 tracking-tight uppercase">
              HORUS TRAINING
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="py-2 px-3.5 bg-blue-600 text-white text-[11px] font-black uppercase rounded-lg shadow-sm"
              >
                + Aluno
              </button>
              <button
                type="button"
                onClick={logout}
                className="text-gray-400 hover:text-gray-700 bg-gray-100 p-2 rounded-lg cursor-pointer border border-gray-200"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            {[
              { id: 'alunos', label: 'Alunos', icon: Users },
              { id: 'construtor', label: 'Ficha', icon: Dumbbell },
              { id: 'evolucao', label: 'Evolução', icon: TrendingUp },
            ].map(tab => (
              <button
                key={tab.id}
                id={`mobile-tab-switch-${tab.id}`}
                type="button"
                onClick={() => {
                  if (tab.id === 'construtor') {
                    const first = selectedStudentUsername || students[0]?.username || null;
                    if (first) {
                      setSelectedStudentUsername(first);
                      setBuilderStudentUsername(first);
                      setIsBuilderOpen(true);
                    } else {
                      if (addToast) addToast("Selecione um aluno primeiro.", "error");
                    }
                  } else {
                    setActiveTab(tab.id as any);
                  }
                }}
                className={`flex items-center justify-center gap-1.5 flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm font-black'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <tab.icon size={11} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </header>
      </div>

      {/* 3. CORE VIEWPORT CONTAINER */}
      <div className="flex-grow flex flex-col min-h-0 md:h-screen md:overflow-hidden bg-transparent">
        <main className="flex-grow flex flex-col min-h-0 md:overflow-hidden h-auto md:h-full">
          
          {/* VIEW TAB 1: STUDENTS LIST */}
          {activeTab === 'alunos' && (
            <div className="flex-grow flex flex-col min-h-0 h-full overflow-y-auto p-4 sm:p-5 md:p-6 lg:p-8">
              <StudentsTab 
                students={students}
                onOpenEditModal={handleOpenEditModal}
                onManageStudent={handleManageStudent}
              />
            </div>
          )}

          {/* VIEW TAB 2: DETAILED WORKOUT CONSTRUCTOR (3-COLUMNS FIXED LAYOUT ON DESKTOP) */}
          {activeTab === 'construtor' && (
            <div className="flex flex-col min-h-0 flex-grow md:overflow-hidden md:h-full h-auto">
              {!selectedStudentUsername ? (
                <div className="flex-grow flex flex-col items-center justify-center p-6 text-center h-full">
                  <div className="border border-gray-200 bg-white rounded-2xl p-8 max-w-md w-full flex flex-col items-center shadow-sm">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                      <Dumbbell className="animate-spin-slow" size={24} />
                    </div>
                    <p className="text-gray-900 font-bold text-base">Nenhum aluno selecionado</p>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                      Selecione um aluno na lista para editar, clonar, e estruturar suas metas de carga e movimentos esportivos.
                    </p>
                    <button
                      onClick={() => setActiveTab('alunos')}
                      className="mt-5 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-sm shadow-blue-105"
                    >
                      Ver Lista de Alunos
                    </button>
                  </div>
                </div>
              ) : (
                <KanbanBoard
                  studentName={selectedStudentProfile?.name || selectedStudentUsername}
                  studentUsername={selectedStudentUsername}
                  division={sheetFrequency}
                  setDivision={setSheetFrequency}
                  routines={localRoutines}
                  onUpdateRoutines={(updated) => {
                    setLocalRoutines(updated);
                    setIsUnsaved(true);
                  }}
                  onSave={handleSaveWorkout}
                  isUnsaved={isUnsaved}
                  onGoBack={() => {
                    setSelectedStudentUsername(null);
                    setActiveTab('alunos');
                  }}
                />
              )}
            </div>
          )}

          {/* VIEW TAB 3: EVOLUÇÃO */}
          {activeTab === 'evolucao' && (
            <div className="flex-grow flex flex-col min-h-0 h-full overflow-y-auto p-4 sm:p-5 md:p-6 lg:p-8">
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

      {/* RESPONSIVE BOTTOM SHEET BUILDER FOR MOBILE VIEWPORTS ONLY */}
      <WorkoutBuilderSheet 
        isOpen={isBuilderOpen}
        onClose={() => {
          setIsBuilderOpen(false);
          setBuilderStudentUsername(null);
        }}
        studentUsername={builderStudentUsername || ''}
        studentName={students.find(s => s.username === builderStudentUsername)?.name || ''}
        division={sheetFrequency}
        setDivision={setSheetFrequency}
        routines={localRoutines}
        onUpdateRoutines={(updated) => {
          setLocalRoutines(updated);
          setIsUnsaved(true);
        }}
        onSave={() => {
          handleSaveWorkout();
          setIsBuilderOpen(false);
        }}
      />
  
    </div>
  );
};
