import React from 'react';
import { AnimatePresence } from 'motion/react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';
import { User } from '../../../types';

interface StudentModalsProps {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  newStudentData: any;
  setNewStudentData: (data: any) => void;
  onCreateStudentSubmit: (e: React.FormEvent) => void;
  
  editingStudent: User | null;
  setEditingStudent: (student: User | null) => void;
  editStudentData: any;
  setEditStudentData: (data: any) => void;
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
  onDeleteStudent,
}) => {
  return (
    <>
      {/* CADASTRO DE ALUNO NOVO */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade">
            <div className="bg-white border border-gray-100 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus size={18} className="text-blue-600" />
                  <span className="text-base font-bold text-gray-900">Cadastrar Novo Aluno</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)} 
                  className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={onCreateStudentSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Nome completo</label>
                  <input 
                    type="text"
                    required
                    value={newStudentData.name}
                    onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                    placeholder="Ex: Ana Souza"
                    className="w-full bg-gray-50 border border-gray-250 text-gray-950 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Login (Usuário)</label>
                  <input 
                    type="text"
                    required
                    value={newStudentData.username}
                    onChange={(e) => setNewStudentData({ ...newStudentData, username: e.target.value })}
                    placeholder="Ex: anasouza"
                    className="w-full bg-gray-50 border border-gray-250 text-gray-950 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Senha de entrada</label>
                  <input 
                    type="text"
                    value={newStudentData.password}
                    onChange={(e) => setNewStudentData({ ...newStudentData, password: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-250 text-gray-950 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Gênero</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewStudentData({ ...newStudentData, sex: 'masculino' })}
                      className={`py-3 text-xs font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                        newStudentData.sex === 'masculino' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' 
                          : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      Masculino (Azul)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewStudentData({ ...newStudentData, sex: 'feminino' })}
                      className={`py-3 text-xs font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                        newStudentData.sex === 'feminino' 
                          ? 'bg-pink-50 text-pink-700 border-pink-200 shadow-sm' 
                          : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      Feminino (Rosa)
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all mt-4 cursor-pointer shadow-sm active:scale-95"
                >
                  Confirmar Cadastro
                </button>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIÇÃO DE ALUNO / EXCLUSÃO */}
      <AnimatePresence>
        {editingStudent && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade">
            <div className="bg-white border border-gray-100 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-blue-600" />
                  <span className="text-base font-bold text-gray-900">Editar Cadastro</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setEditingStudent(null)} 
                  className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={onEditStudentSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Nome completo</label>
                  <input 
                    type="text"
                    required
                    value={editStudentData.name}
                    onChange={(e) => setEditStudentData({ ...editStudentData, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-255 text-gray-950 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Login (Usuário)</label>
                  <input 
                    type="text"
                    required
                    value={editStudentData.username}
                    onChange={(e) => setEditStudentData({ ...editStudentData, username: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-255 text-gray-950 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Senha</label>
                  <input 
                    type="text"
                    value={editStudentData.password}
                    onChange={(e) => setEditStudentData({ ...editStudentData, password: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-255 text-gray-950 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Gênero</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditStudentData({ ...editStudentData, sex: 'masculino' })}
                      className={`py-3 text-xs font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                        editStudentData.sex === 'masculino' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      Masculino (Azul)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditStudentData({ ...editStudentData, sex: 'feminino' })}
                      className={`py-3 text-xs font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                        editStudentData.sex === 'feminino' 
                          ? 'bg-pink-50 text-pink-700 border-pink-200' 
                          : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      Feminino (Rosa)
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={(e) => onDeleteStudent(editingStudent.username, e)}
                    className="flex-1 py-3.5 bg-red-50 hover:bg-red-105 text-red-650 border border-red-200 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Excluir Aluno
                  </button>

                  <button 
                    type="submit"
                    className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all cursor-pointer shadow-sm shadow-blue-200"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StudentModals;
