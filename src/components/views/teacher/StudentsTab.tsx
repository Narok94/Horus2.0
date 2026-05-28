import React from 'react';
import { Users, MoreVertical, Flame } from 'lucide-react';
import { User } from '../../../types';

interface StudentsTabProps {
  students: User[];
  onOpenEditModal: (student: User) => void;
  onManageStudent: (username: string) => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({ 
  students, 
  onOpenEditModal, 
  onManageStudent 
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent text-white font-sans antialiased text-left space-y-4">
      {/* HEADER TABS COMPACT */}
      <div className="space-y-1 px-1 shrink-0 mb-2 border-b border-white/[0.015] pb-3">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 font-mono">Diretoria</span>
        <h2 className="text-lg font-extrabold text-white tracking-tight leading-none mt-1">Meus Alunos Registrados</h2>
        <p className="text-xs text-zinc-500 leading-normal">
          Selecione um aluno para gerenciar suas planilhas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto no-scrollbar pb-safe-bottom px-1">
        {students.map((student) => {
          const isFemale = student.username === 'teste2' || student.sex === 'feminino';
          return (
            <div 
              key={student.username} 
              className="group bg-[#111318] border border-white/[0.015] rounded-xl hover:bg-[#171A20] hover:border-white/5 transition-all text-left flex flex-col justify-between"
            >
              {/* Top part / Details */}
              <div className="p-3.5 space-y-3 pb-2 flex-grow">
                {/* Meta Head */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center font-bold text-white text-xs select-none shadow-sm uppercase overflow-hidden">
                      {student.avatar ? (
                        <img src={student.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        student.name.substring(0, 2)
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-tight">{student.name}</h3>
                      <p className="text-[9px] font-mono text-zinc-500 tracking-wider">@{student.username}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onOpenEditModal(student)}
                    className="p-1 text-zinc-600 hover:text-white rounded transition-colors"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  <div className="bg-[#09090B] border border-white/[0.02] p-2 rounded-lg text-left shadow-sm">
                    <span className="text-[8px] font-bold text-zinc-500 block uppercase tracking-wider mb-0.5 font-mono">Treinos</span>
                    <span className="text-[11px] font-extrabold text-white font-mono">{student.totalWorkouts || 0}</span>
                  </div>
                  <div className="bg-[#09090B] border border-white/[0.02] p-2 rounded-lg text-left flex gap-1 items-center shadow-sm">
                    <div className="flex-1">
                      <span className="text-[8px] font-bold text-zinc-500 block uppercase tracking-wider mb-0.5 font-mono">Streak</span>
                      <span className="text-[11px] font-extrabold text-white font-mono">{student.streak || 0}</span>
                    </div>
                    {(student.streak || 0) > 0 && <Flame size={12} className="text-amber-500 opacity-80 animate-pulse" />}
                  </div>
                </div>
              </div>

              {/* Action Buttons split */}
              <div className="border-t border-white/[0.015] p-2 flex gap-1 mt-auto">
                <button
                  type="button"
                  onClick={() => onManageStudent(student.username)}
                  className="flex-1 py-1.5 bg-accent hover:brightness-105 text-[#050505] rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Users size={10} /> Gerenciar
                </button>
              </div>
            </div>
          );
        })}

        {students.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 py-16 text-center border border-dashed border-white/5 rounded-2xl">
            <Users size={24} className="mx-auto text-zinc-600 mb-3" />
            <p className="text-zinc-400 font-medium text-xs">Nenhum aluno registrado.</p>
            <p className="text-[10px] text-zinc-600 mt-1">Utilize o botão lateral para adicionar novos alunos à sua diretoria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
