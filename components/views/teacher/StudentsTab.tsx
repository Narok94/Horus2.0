import React from 'react';
import { Users, Settings, Dumbbell, UserCheck } from 'lucide-react';
import { User } from '../../../types';

interface StudentsTabProps {
  students: User[];
  onOpenEditModal: (student: User) => void;
  onManageStudent: (username: string) => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  students,
  onOpenEditModal,
  onManageStudent,
}) => {
  return (
    <div className="flex-grow pb-10 space-y-6">
      {/* Title block */}
      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-900">Alunos Cadastrados</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie e crie fichas de treinamento individuais ({students.length} alunos cadastrados)
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {students.map((student) => {
          const isFemale = student.sex === 'feminino';
          const countOfWorkouts = student.totalWorkouts || 0;
          
          return (
            <div 
              key={student.username}
              className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-250 cursor-pointer"
              onClick={() => onManageStudent(student.username)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Visual representation of Student gender */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-50 text-blue-500">
                      <Users size={18} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-base font-bold text-gray-900 truncate block">
                        {student.name}
                      </span>
                      <span className="text-xs font-mono text-gray-400 block mt-0.5">
                        @{student.username}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 bg-gray-50 border border-gray-100 px-3.5 py-2.5 rounded-xl flex items-center justify-between">
                  <span className="text-gray-400 font-bold text-xs uppercase tracking-wide">Frequência/Checkins:</span>
                  <span className="font-extrabold text-gray-800 text-xs bg-white border border-gray-200 px-3 py-1 rounded-lg">
                    {countOfWorkouts} {countOfWorkouts === 1 ? 'concluído' : 'concluídos'}
                  </span>
                </div>
              </div>

              {/* Action buttons styled with large touch boundaries */}
              <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onOpenEditModal(student)}
                  className="w-14 h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl flex items-center justify-center transition-all cursor-pointer border border-gray-200"
                  title="Configurações do Aluno"
                >
                  <Settings size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => onManageStudent(student.username)}
                  className="flex-grow h-11 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <Dumbbell size={14} />
                  <span>Montar Ficha</span>
                </button>
              </div>
            </div>
          );
        })}

        {students.length === 0 && (
          <div className="col-span-full border-2 border-slate-200 border-dashed bg-white py-16 text-center rounded-2xl flex flex-col items-center justify-center p-6 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
              <Users size={28} />
            </div>
            <h3 className="text-slate-800 font-bold text-lg">Nenhum aluno cadastrado no sistema</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
              Clique no botão "+ Novo Aluno" no topo direito para cadastrar o primeiro e começar a sua montagem de rotinas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
