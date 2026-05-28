import React from 'react';
import { User } from '../../../types';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StudentModalsProps {
  showAddModal: boolean;
  setShowAddModal: (val: boolean) => void;
  newStudentData: { username: string; name: string; password?: string; sex: 'masculino' | 'feminino' };
  setNewStudentData: (val: any) => void;
  onCreateStudentSubmit: (e: React.FormEvent) => void;
  
  editingStudent: User | null;
  setEditingStudent: (user: User | null) => void;
  editStudentData: { username: string; name: string; password?: string; sex: 'masculino' | 'feminino' };
  setEditStudentData: (val: any) => void;
  onEditStudentSubmit: (e: React.FormEvent) => void;
  onDeleteStudent: (username: string, e: React.MouseEvent) => void;
}

export const StudentModals: React.FC<StudentModalsProps> = ({
  showAddModal,
  setShowAddModal,
  newStudentData,
  setNewStudentData,
  onCreateStudentSubmit,
  editingStudent,
  setEditingStudent,
  editStudentData,
  setEditStudentData,
  onEditStudentSubmit,
  onDeleteStudent
}) => {
  return (
    <AnimatePresence>
      {showAddModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm bg-zinc-950 border border-white/5 rounded-2xl p-6 shadow-2xl relative text-left"
          >
            <div className="flex justify-between items-center mb-5 border-b border-white/[0.02] pb-3">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">Adicionar Aluno</h3>
                <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Criar perfil em branco</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white p-2 rounded-lg bg-zinc-900 transition-colors">
                <X size={14} />
              </button>
            </div>
            
            <form onSubmit={onCreateStudentSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[8.5px] font-black uppercase text-zinc-400 tracking-wider font-mono">Apelido (Login)</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  placeholder="aluno_novo"
                  value={newStudentData.username}
                  onChange={e => setNewStudentData({...newStudentData, username: e.target.value.toLowerCase().replace(/\s+/g,'_')})}
                  className="w-full bg-[#0B0C0E] border border-white/5 text-white font-bold px-3 py-2.5 rounded-lg focus:outline-none focus:border-white/20 uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[8.5px] font-black uppercase text-zinc-400 tracking-wider font-mono">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nome do Aluno"
                  value={newStudentData.name}
                  onChange={e => setNewStudentData({...newStudentData, name: e.target.value})}
                  className="w-full bg-[#0B0C0E] border border-white/5 text-white font-bold px-3 py-2.5 rounded-lg focus:outline-none focus:border-white/20 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[8.5px] font-black uppercase text-zinc-400 tracking-wider font-mono">Senha Inicial</label>
                  <input 
                    type="text" 
                    value={newStudentData.password}
                    onChange={e => setNewStudentData({...newStudentData, password: e.target.value})}
                    className="w-full bg-[#0B0C0E] border border-white/5 text-zinc-400 font-bold font-mono px-3 py-2.5 rounded-lg text-xs"
                  />
                  <p className="text-[7.5px] text-zinc-600 font-mono">Padrão: 12345</p>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[8.5px] font-black uppercase text-zinc-400 tracking-wider font-mono">Sexo Fisiológico</label>
                  <select
                    value={newStudentData.sex}
                    onChange={e => setNewStudentData({...newStudentData, sex: e.target.value as 'masculino' | 'feminino'})}
                    className="w-full bg-[#0B0C0E] border border-white/5 text-white font-bold uppercase px-2 py-2.5 rounded-lg focus:outline-none text-[10px]"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full mt-4 bg-white text-black hover:bg-zinc-200 py-3 rounded-lg font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1">
                <Check size={14} /> Registrar Diretoria Direta
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm bg-zinc-950 border border-white/5 rounded-2xl p-6 shadow-2xl relative text-left"
          >
            <div className="flex justify-between items-center mb-5 border-b border-white/[0.02] pb-3">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">Editar Dados Físicos</h3>
                <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Editando @{editingStudent.username}</p>
              </div>
              <button onClick={() => setEditingStudent(null)} className="text-zinc-500 hover:text-white p-2 rounded-lg bg-zinc-900 transition-colors">
                <X size={14} />
              </button>
            </div>
            
            <form onSubmit={onEditStudentSubmit} className="space-y-4">
              <div className="space-y-1.5 border-b border-white/5 pb-4">
                <label className="text-[8.5px] font-black uppercase text-zinc-400 tracking-wider font-mono">Nome Legal do Atleta</label>
                <input 
                  type="text" 
                  required
                  value={editStudentData.name}
                  onChange={e => setEditStudentData({...editStudentData, name: e.target.value})}
                  className="w-full bg-[#0B0C0E] border border-white/5 text-white font-bold px-3 py-2.5 rounded-lg focus:outline-none focus:border-white/20 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pb-2 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[8.5px] font-black uppercase text-amber-500/70 tracking-wider font-mono">Alterar Senha</label>
                  <input 
                    type="text" 
                    value={editStudentData.password}
                    onChange={e => setEditStudentData({...editStudentData, password: e.target.value})}
                    className="w-full bg-[#0B0C0E] border border-amber-500/20 focus:border-amber-500 text-amber-500 font-bold font-mono px-3 py-2.5 rounded-lg text-xs"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[8.5px] font-black uppercase text-zinc-400 tracking-wider font-mono">Sexo F/M Fisiológico</label>
                  <select
                    value={editStudentData.sex}
                    onChange={e => setEditStudentData({...editStudentData, sex: e.target.value as 'masculino' | 'feminino'})}
                    className="w-full bg-[#0B0C0E] border border-white/5 text-white font-bold uppercase px-2 py-2.5 rounded-lg focus:outline-none text-[10px]"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                 <button type="submit" className="w-full bg-white text-black hover:bg-zinc-200 py-3 rounded-lg font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm">
                   Aplicar Modificações Estruturais
                 </button>

                 <button 
                   type="button" 
                   onClick={(e) => onDeleteStudent(editingStudent.username, e)}
                   className="w-full bg-transparent hover:bg-rose-500/10 text-rose-500 hover:text-rose-400 py-2.5 rounded-lg font-black uppercase tracking-wider text-[8px] transition-all cursor-pointer font-mono"
                 >
                   Excluir Totalmente Aluno da Nuvem
                 </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
