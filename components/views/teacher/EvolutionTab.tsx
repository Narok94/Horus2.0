import React from 'react';
import { TrendingUp, User, Medal, Flame } from 'lucide-react';
import { User as UserType } from '../../../types';

interface EvolutionTabProps {
  selectedStudentUsername: string | null;
  selectedStudentProfile: UserType | undefined;
  onTabChange: (tab: 'alunos' | 'construtor' | 'evolucao') => void;
}

export const EvolutionTab: React.FC<EvolutionTabProps> = ({
  selectedStudentUsername,
  selectedStudentProfile,
  onTabChange,
}) => {
  if (!selectedStudentUsername) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-white border border-gray-200 rounded-2xl min-h-[350px] shadow-sm">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <TrendingUp size={28} />
        </div>
        <h3 className="text-gray-900 text-lg font-bold">Nenhum aluno selecionado</h3>
        <p className="text-gray-500 text-sm max-w-sm mt-2 mb-6 leading-relaxed">
          Selecione um aluno na lista para consultar registros de evolução, metas de carga e histórico.
        </p>
        <button
          onClick={() => onTabChange('alunos')}
          className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm active:scale-95"
        >
          Ver Alunos
        </button>
      </div>
    );
  }

  return (
    <div className="flex-grow pb-12 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-900">Progresso do Aluno</h2>
          <p className="text-sm text-gray-500 mt-1">
            Métricas ativas e histórico de <span className="text-blue-600 font-bold">{selectedStudentProfile?.name || selectedStudentUsername}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => onTabChange('alunos')}
          className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-750 rounded-xl text-sm font-bold transition-colors cursor-pointer"
        >
          Trocar Aluno
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
            <Flame size={22} />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">Frequência Semanal</span>
            <span className="text-lg font-bold text-gray-900">{selectedStudentProfile?.streak || 0} treinos ativos</span>
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">Total de Treinos</span>
            <span className="text-lg font-bold text-gray-900">{selectedStudentProfile?.totalWorkouts || 0} concluídos</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metas de Carga de Treino */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-black text-gray-400 block mb-4 pb-2 border-b border-gray-100 uppercase tracking-wider">Cargas Máximas Registradas</span>
          
          {selectedStudentProfile?.weights && Object.keys(selectedStudentProfile.weights).filter(key => !key.startsWith('ex_')).length > 0 ? (
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
              {Object.entries(selectedStudentProfile.weights).map(([exLabel, weightVal]) => {
                if (exLabel.startsWith('ex_')) return null;
                return (
                  <div key={exLabel} className="flex justify-between items-center text-sm py-3 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                    <span className="text-gray-800 font-medium">{exLabel}</span>
                    <span className="font-mono text-blue-600 bg-blue-50 px-3 py-1 rounded-xl text-xs font-bold">{weightVal} kg</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-16">Nenhuma carga salva no perfil ainda.</p>
          )}
        </div>

        {/* Últimos Treinos Conclusos */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-black text-gray-400 block mb-4 pb-2 border-b border-gray-100 uppercase tracking-wider">Histórico de Sessões</span>
          
          {selectedStudentProfile?.history && selectedStudentProfile.history.length > 0 ? (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {selectedStudentProfile.history.slice(0, 5).map((entry, eIdx) => (
                <div key={eIdx} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between text-sm font-bold mb-3">
                    <span className="text-blue-600">{entry.workoutTitle}</span>
                    <span className="text-gray-400 font-mono text-xs">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2.5 border-t border-gray-200">
                    {entry.exercises.map((ex, exIdx) => (
                      <div key={exIdx} className="flex justify-between text-xs items-center">
                        <span className="text-gray-600 font-medium">{ex.name}</span>
                        <span className="text-gray-800 font-mono font-bold">
                          {ex.performance.length} séries • {ex.performance[0]?.weight || 0}kg
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-16">Nenhuma sessão registrada pelo aluno anteriormente.</p>
          )}
        </div>
      </div>
    </div>
  );
};
