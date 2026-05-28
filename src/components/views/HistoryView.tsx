import React from 'react';
import { useStore } from '../../store';
import { History, Calendar, Clock, LogOut, Wind } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { user, logout } = useStore();

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s]
      .map(v => v < 10 ? "0" + v : v)
      .filter((v, i) => v !== "00" || i > 0)
      .join(":");
  };

  const handleVibrate = (ms = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  return (
    <div className="h-full max-h-full overflow-hidden flex flex-col justify-between pb-1 bg-transparent select-none font-sans">
      <header className="flex items-center justify-between py-1.5 px-1.5 border-b border-white/5 shrink-0">
        <div>
          <h1 className="text-xl font-black text-white tracking-tighter italic uppercase leading-none">Meus <span className="text-accent">Treinos</span></h1>
          <p className="text-white/40 uppercase tracking-widest mt-1 text-[8px] font-mono">Histórico de progresso.</p>
        </div>
        <button 
          onClick={() => {
            handleVibrate(15);
            logout();
          }} 
          className="text-[7.5px] font-black text-rose-500/70 hover:text-rose-500 uppercase tracking-widest transition-colors py-1 px-2 border border-rose-500/10 rounded bg-rose-500/[0.02]"
          title="Sair"
        >
          SAIR
        </button>
      </header>
      
      {user?.history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-500 mb-2">
            <History size={16} />
          </div>
          <p className="text-zinc-500 text-[8.5px] font-black uppercase tracking-[0.15em]">Sua história começa agora.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar py-2 space-y-3 mt-2">
          {user?.history.map((entry) => {
            const isFemale = user?.username.toLowerCase() === 'teste2' || user?.username.toLowerCase().includes('jessica') || user?.sex === 'feminino';
            const accentColor = isFemale ? '#FF007F' : '#00F0FF';
            return (
              <div 
                key={entry.id} 
                className="bg-zinc-900/40 border border-zinc-850/80 rounded-2xl p-4.5 space-y-3.5 shadow-sm transition-all duration-200 hover:bg-zinc-900/60 hover:border-zinc-800"
              >
                <div className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div 
                      className="w-[3px] h-5.5 rounded-full shrink-0" 
                      style={{ backgroundColor: accentColor }} 
                    />
                    <div className="min-w-0">
                      <h3 className="text-[13px] font-black text-white uppercase tracking-tight italic leading-tight truncate">
                        {entry.workoutTitle}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-zinc-500 leading-none">
                        <Calendar size={9} />
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wider">
                          {new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 shrink-0 text-right leading-none">
                    <span 
                      className="border px-2 py-0.5 rounded text-[7.5px] font-black uppercase tracking-wider font-mono leading-none"
                      style={{ 
                        color: accentColor, 
                        borderColor: `${accentColor}25`, 
                        backgroundColor: `${accentColor}08` 
                      }}
                    >
                      CONCLUÍDO
                    </span>
                    {entry.duration && (
                      <div className="flex items-center gap-0.5 text-[8px] font-mono font-extrabold text-zinc-400 uppercase leading-none mt-1">
                        <Clock size={8.5} className="text-zinc-500" />
                        <span>{formatTime(entry.duration)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Exercises Done */}
                <div className="pt-2.5 border-t border-white/[0.03] space-y-2">
                  <span className="text-[7.5px] font-black uppercase tracking-widest text-zinc-500 font-mono block">
                    Cargas e Exercícios Registrados:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {entry.exercises.map((ex, idx) => (
                      <div 
                        key={idx} 
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 bg-zinc-950/20 border border-white/[0.015] p-2 rounded-xl"
                      >
                        <span className="text-[10px] font-bold text-zinc-200 uppercase tracking-tight leading-tight">
                          {ex.name}
                        </span>
                        <div className="flex flex-wrap gap-1 shrink-0">
                          {ex.performance && ex.performance.filter(p => p.completed).map((s, si) => (
                            <div key={si} className="text-[7.5px] font-mono font-extrabold bg-[#111318]/60 text-zinc-300 px-1.5 py-0.5 rounded border border-white/5 leading-none">
                              S{si + 1}: {s.weight}kg × {s.reps}
                            </div>
                          ))}
                          {(!ex.performance || ex.performance.filter(p => p.completed).length === 0) && ex.performance && ex.performance.map((s, si) => (
                            <div key={si} className="text-[7.5px] font-mono font-extrabold bg-[#111318]/40 text-zinc-500 px-1.5 py-0.5 rounded border border-white/[0.03] leading-none">
                              S{si + 1}: {s.weight}kg × {s.reps}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {entry.cardio && (
                      <div className="flex items-center justify-between gap-1.5 bg-zinc-950/20 border border-white/[0.015] p-2 rounded-xl">
                        <div className="flex items-center gap-1.5 leading-none">
                          <Wind size={10} style={{ color: accentColor }} />
                          <span className="text-[10px] font-bold text-zinc-200 uppercase tracking-tight leading-none">
                            Aeróbico Intercalar ({entry.cardio.exercise})
                          </span>
                        </div>
                        <span className="text-[7.5px] font-mono font-extrabold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/15 leading-none">
                          {entry.cardio.duration} MINUTOS
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
