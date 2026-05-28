import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { User, WorkoutHistoryEntry } from '../../../types';

interface EvolutionTabProps {
  selectedStudentUsername: string | null;
  selectedStudentProfile?: User;
  onTabChange: (tab: 'alunos' | 'construtor' | 'evolucao') => void;
}

export const EvolutionTab: React.FC<EvolutionTabProps> = ({ 
  selectedStudentUsername, 
  selectedStudentProfile,
  onTabChange
}) => {

  if (!selectedStudentUsername || !selectedStudentProfile) {
    return (
      <div className="flex flex-col items-center justify-center p-8 md:p-16 text-center h-full text-left">
        <div className="border border-zinc-900 border-dashed rounded-2xl p-10 max-w-md w-full bg-zinc-900/10 flex flex-col items-center">
          <p className="text-zinc-200 font-bold text-sm tracking-tight text-center">Nenhum Aluno Selecionado</p>
          <p className="text-xs text-zinc-500 mt-2 leading-relaxed text-center">Selecione um aluno para visualizar o painel histórico e análises de evolução esportiva dele.</p>
          <button
            onClick={() => onTabChange('alunos')}
            className="mt-6 py-3 px-8 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Ver Meus Alunos
          </button>
        </div>
      </div>
    );
  }

  // Derived metrics from user history
  const activeHistory = selectedStudentProfile.history || [];
  
  // Weekly checkins preparation
  const recentCheckins = selectedStudentProfile.checkIns?.slice(-7) || [];
  
  // Generate dummy chart dataset based on history entry counts mapping by date string
  const processFrequencyData = () => {
    if (activeHistory.length === 0) return [];
    
    // Group by Date simplified
    const dateMap: Record<string, number> = {};
    const sortedHistory = [...activeHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Fallback: create artificial 7 day spread if nothing exists realistically for graphic demo
    if (sortedHistory.length < 2) {
         return [
            { name: 'Seg', volume: 4500, time: 45 },
            { name: 'Ter', volume: 5200, time: 55 },
            { name: 'Qua', volume: 0, time: 0 },
            { name: 'Qui', volume: 4800, time: 50 },
            { name: 'Sex', volume: 5500, time: 60 },
            { name: 'Sab', volume: 6000, time: 65 },
            { name: 'Dom', volume: 1500, time: 20 },
         ]
    }
    
    return [
       { name: 'Seg', volume: 4500, time: 45 },
       { name: 'Ter', volume: 5200, time: 55 },
       { name: 'Qua', volume: 4000, time: 42 },
       { name: 'Qui', volume: 4800, time: 50 },
       { name: 'Sex', volume: 5500, time: 60 },
       { name: 'Sab', volume: 6000, time: 65 },
       { name: 'Dom', volume: 1500, time: 20 },
    ];
  };
  
  const chartData = processFrequencyData();

  return (
    <div className="flex flex-col min-h-0 bg-transparent text-white font-sans antialiased text-left space-y-6 lg:max-w-4xl max-w-full">
      <div className="space-y-1 shrink-0 border-b border-white/[0.015] pb-4">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 font-mono">Evolução Analítica</span>
        <h2 className="text-lg font-extrabold text-white tracking-tight leading-none mt-1 flex items-center gap-2">
            Métricas de Desempenho 
            <span className="bg-[#111318] border border-white/5 px-2 py-0.5 rounded text-xs text-zinc-300 font-normal">
              {selectedStudentProfile.name}
            </span>
        </h2>
        <p className="text-xs text-zinc-500 leading-normal">
          Análise de volume, frequência e histórico técnico do atleta.
        </p>
      </div>

      {activeHistory.length === 0 ? (
        <div className="py-12 text-center rounded-2xl bg-zinc-950/40 border border-white/[0.015] p-6 lg:mx-0 shadow-sm text-left mx-auto max-w-md w-full">
           <p className="text-zinc-200 font-bold text-sm tracking-tight text-center">Nenhum dado registrado para {selectedStudentProfile.name}.</p>
           <p className="text-xs text-zinc-500 mt-2 leading-relaxed text-center">O painel analítico começará a exibir gráficos assim que o aluno concluir o primeiro treinamento real.</p>
        </div>
      ) : (
        <div className="space-y-6">
           
           {/* HIGHLIGHT NUMBERS */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#111318] border border-white/[0.015] p-3.5 rounded-xl shadow-sm text-left">
                  <span className="text-[8px] tracking-[0.2em] font-black uppercase text-zinc-500 font-mono">Total Sessões</span>
                  <div className="text-2xl font-black text-white mt-1 font-mono">{activeHistory.length}</div>
              </div>
              <div className="bg-[#111318] border border-white/[0.015] p-3.5 rounded-xl shadow-sm text-left">
                  <span className="text-[8px] tracking-[0.2em] font-black uppercase text-zinc-500 font-mono">Último Treino</span>
                  <div className="text-[11px] font-bold text-white mt-1 uppercase text-wrap break-words">{activeHistory[0]?.workoutTitle || '-'}</div>
              </div>
               <div className="bg-[#111318] border border-white/[0.015] p-3.5 rounded-xl shadow-sm md:col-span-2 text-left">
                  <span className="text-[8px] tracking-[0.2em] font-black uppercase text-zinc-500 font-mono">Feedback da Máquina</span>
                  <div className="text-[10px] font-bold text-emerald-400 mt-1 uppercase text-wrap font-mono relative pr-1">
                      Constância estabelecida no bloco {activeHistory[0]?.workoutTitle.charAt(activeHistory[0]?.workoutTitle.length-1) || 'A'} com retenção de volume. Recomendado sustentar a progressão primária.
                  </div>
              </div>
           </div>

           {/* GRÁFICO - VOLUME CARGA-TONELADA (FAKE CHART BASE) */}
           <div className="bg-[#0B0C0F] border border-white/[0.015] p-4 rounded-xl shadow-sm">
              <div className="mb-4">
                 <h3 className="text-[11px] font-black text-white uppercase tracking-tight">Estima de Volume Semanal</h3>
                 <p className="text-[9px] text-zinc-500 font-mono">Avaliação da densidade de trabalho baseada em checkins regulares (Falsa Representação Visual).</p>
              </div>
              <div className="h-48 w-full font-mono text-[9px] select-none">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                       <defs>
                          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.6}/>
                             <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="name" stroke="#3f3f46" tick={{fill: '#71717a'}} axisLine={false} tickLine={false} />
                       <YAxis stroke="#3f3f46" tick={{fill: '#71717a'}} axisLine={false} tickLine={false} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                          itemStyle={{ color: '#00F0FF', fontWeight: 'bold' }}
                       />
                       <Area type="monotone" dataKey="volume" stroke="#00F0FF" fillOpacity={1} fill="url(#colorVolume)" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* LOG SECTION RAW DATA */}
           <div className="bg-[#111318] border border-white/[0.015] p-4 rounded-xl shadow-sm text-left">
              <h3 className="text-[11px] font-black text-white uppercase tracking-tight mb-3">Histórico Bruto</h3>
              <div className="space-y-1.5 overflow-y-auto max-h-[300px] no-scrollbar pr-1">
                 {activeHistory.slice(0, 10).map(entry => (
                    <div key={entry.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-[#09090B] border border-white/[0.02] p-2.5 rounded-lg gap-2 text-left shadow-sm hover:border-white/5 transition-all">
                       <div className="flex items-center gap-2">
                           <div className="text-[10px] bg-zinc-900 border border-white/5 text-zinc-400 font-mono px-1.5 py-0.5 rounded capitalize">
                              {new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                           </div>
                           <h4 className="text-[10px] font-bold text-white uppercase tracking-tight text-left min-w-0 flex-1 truncate">{entry.workoutTitle}</h4>
                       </div>
                       <div className="flex gap-2 shrink-0">
                           <span className="text-[8px] font-black font-mono bg-zinc-950 px-2 py-0.5 rounded text-zinc-500 uppercase tracking-wider">{entry.exercises.length} Ex</span>
                           <span className="text-[8px] font-black font-mono bg-[#1E3A8A]/10 text-blue-400 border border-[#1E3A8A]/30 px-2 py-0.5 rounded uppercase">{Math.floor(entry.duration / 60)} min</span>
                       </div>
                    </div>
                 ))}
                 {activeHistory.length > 10 && (
                     <div className="text-center pt-2 text-[9px] font-mono text-zinc-500">+ {activeHistory.length - 10} sessões arquivadas no log global.</div>
                 )}
              </div>
           </div>

        </div>
      )}
    </div>
  );
};
