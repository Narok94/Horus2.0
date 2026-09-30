import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, Dumbbell, Flame, XCircle, Droplets, Moon, Utensils, 
  ChevronLeft, ChevronRight, Activity, CalendarDays, BarChart3, 
  Trophy, Plus, X, ArrowLeft, TrendingDown, Scale, Ruler
} from 'lucide-react';
import { useStore } from '../../store';
import { AppTab, DailyCheck, BodyMeasurement } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HABITS: { key: keyof DailyCheck; label: string; icon: any; manual: boolean }[] = [
  { key: 'treino', label: 'Treino', icon: Dumbbell, manual: true },
  { key: 'zeroDoce', label: 'Zero Doce', icon: Flame, manual: true },
  { key: 'zeroBesteira', label: 'Zero Besteira', icon: XCircle, manual: true },
  { key: 'agua', label: 'Água', icon: Droplets, manual: true },
  { key: 'sono', label: 'Sono (> 7h)', icon: Moon, manual: true },
  { key: 'dietaRegulada', label: 'Dieta 100%', icon: Utensils, manual: false }
];

export const DesafioView: React.FC = () => {
  const { user, theme, setActiveTab, toggleDailyHabit, addMeasurement } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'hoje' | 'progresso' | 'historico' | 'comparativo'>('hoje');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  
  const getLocalToday = () => {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzOffset).toISOString().split('T')[0];
  };
  
  const [currentDate, setCurrentDate] = useState<string>(getLocalToday());
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [measurementForm, setMeasurementForm] = useState<Partial<BodyMeasurement>>({});
  const [selectedMetric, setSelectedMetric] = useState<'peso' | 'percentualGordura' | 'cintura'>('peso');

  const isLightUser = user?.username.toLowerCase() === 'henrique' || theme === 'light';

  if (!user || !user.challenge90) {
    return (
      <div className={`w-full min-h-screen flex flex-col items-center justify-center p-6 text-center ${isLightUser ? 'text-zinc-950 bg-transparent' : 'text-white'}`}>
        <Target size={48} className={isLightUser ? 'text-zinc-400 mb-4' : 'text-zinc-600 mb-4'} />
        <h2 className="text-xl font-bold mb-2">Desafio não encontrado</h2>
        <p className={`text-sm ${isLightUser ? 'text-zinc-500' : 'text-zinc-400'}`}>Você não possui um desafio 90 dias ativo no momento.</p>
        <button onClick={() => setActiveTab(AppTab.DASHBOARD)} className="mt-6 px-6 py-2 bg-[#2563EB] text-white rounded-lg font-bold">Voltar</button>
      </div>
    );
  }

  const challenge = user.challenge90;

  // Navigation handlers
  const changeDate = (days: number) => {
    const d = new Date(currentDate);
    d.setUTCDate(d.getUTCDate() + days);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const getStudentData = (username: string) => {
    if (user.username.toLowerCase() === username.toLowerCase()) return user;
    try {
      const saved = localStorage.getItem(`tatugym_user_profile_${username.toLowerCase()}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  };

  const henrique = getStudentData('henrique');
  const jessica = getStudentData('jessica');

  const getStats = (u: any) => {
    if (!u || !u.challenge90) return { streak: 0, daysLeft: 0, percentCompleted: 0 };
    const c = u.challenge90;
    const start = new Date(c.dataInicio);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 90);
    const now = new Date(getLocalToday());
    
    let daysPassed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysPassed < 0) daysPassed = 0;
    if (daysPassed > 90) daysPassed = 90;
    const daysLeft = 90 - daysPassed;

    let streak = 0;
    const sortedChecks = [...(c.dailyChecks || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const check of sortedChecks) {
      if (check.date > getLocalToday()) continue; // Ignore future
      const totalHabits = HABITS.length;
      const completedHabits = HABITS.filter(h => check[h.key]).length;
      if (completedHabits === totalHabits) {
        streak++;
      } else if (check.date < getLocalToday()) {
        break; // Streak broken
      }
    }

    let totalPossibleHabits = daysPassed * HABITS.length;
    if (totalPossibleHabits === 0) totalPossibleHabits = 1; // avoid div by 0
    let totalCompleted = 0;
    (c.dailyChecks || []).forEach((check: any) => {
       if (check.date <= getLocalToday()) {
         HABITS.forEach(h => {
           if (check[h.key]) totalCompleted++;
         });
       }
    });

    const percentCompleted = Math.round((totalCompleted / totalPossibleHabits) * 100);

    return { streak, daysLeft, percentCompleted };
  };

  const myStats = getStats(user);

  // Dynamic theme-based styles
  const cardClass = isLightUser ? 'bg-white border-zinc-200 shadow-sm' : 'bg-[#1A1A1A] border-white/5';
  const textPrimary = isLightUser ? 'text-zinc-950 font-black' : 'text-white font-bold';
  const textSecondary = isLightUser ? 'text-zinc-500 font-bold' : 'text-white/50';
  
  const renderHoje = () => {
    const todayCheck = challenge.dailyChecks?.find(c => c.date === currentDate) || {} as DailyCheck;
    const isToday = currentDate === getLocalToday();
    
    return (
      <div className="space-y-4 animate-fade-in pb-20">
        <div className="flex gap-3">
          {/* Streak Card */}
          <div className="flex-1 bg-gradient-to-br from-[#2563EB] to-[#122C60] rounded-2xl p-4 shadow-lg text-white">
            <span className="text-[9px] font-black tracking-widest uppercase opacity-70">SEQUÊNCIA</span>
            <div className="flex items-end gap-1 mt-1">
              <span className="text-3xl font-black leading-none">{myStats.streak}</span>
              <span className="text-xs font-bold opacity-80 mb-0.5">dias</span>
            </div>
          </div>

          {/* Remaining Days Card */}
          <div className={`flex-1 border rounded-2xl p-4 ${cardClass}`}>
            <span className={`text-[9px] font-black tracking-widest uppercase ${isLightUser ? 'text-zinc-400' : 'opacity-70 text-white/70'}`}>RESTANTES</span>
            <div className="flex items-end gap-1 mt-1">
              <span className={`text-3xl font-black leading-none ${isLightUser ? 'text-zinc-950' : 'text-white'}`}>{myStats.daysLeft}</span>
              <span className={`text-xs font-bold mb-0.5 ${isLightUser ? 'text-zinc-500' : 'opacity-80 text-white/80'}`}>dias</span>
            </div>
          </div>
        </div>

        {/* Date Navigator */}
        <div className={`flex items-center justify-between border rounded-2xl p-2 ${cardClass}`}>
          <button onClick={() => changeDate(-1)} className={`p-2 transition-colors ${isLightUser ? 'text-zinc-500 hover:text-zinc-850' : 'text-white/60 hover:text-white'}`}>
            <ChevronLeft size={20} />
          </button>
          <span className={`text-sm font-bold uppercase tracking-widest ${isLightUser ? 'text-zinc-900' : 'text-white'}`}>
            {isToday ? 'HOJE' : new Date(currentDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
          </span>
          <button onClick={() => changeDate(1)} className={`p-2 transition-colors ${isLightUser ? 'text-zinc-500 hover:text-zinc-850' : 'text-white/60 hover:text-white'}`} disabled={isToday}>
            {isToday ? <div className="w-5 h-5" /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Habits Checklist Grid */}
        <div className="grid grid-cols-2 gap-3">
          {HABITS.map(h => {
            const isCompleted = todayCheck[h.key];
            const Icon = h.icon;
            return (
              <div 
                key={h.key}
                onClick={() => {
                  if (h.manual) {
                    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(10);
                    toggleDailyHabit(currentDate, h.key);
                  }
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                  isCompleted 
                    ? 'bg-[#2563EB]/10 border-[#2563EB]/40 text-[#2563EB] dark:bg-[#2563EB]/20 dark:border-[#2563EB]/50' 
                    : isLightUser
                      ? 'bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50'
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                } ${h.manual ? 'cursor-pointer active:scale-95' : 'opacity-70'}`}
              >
                <Icon size={24} className="mb-2" />
                <span className={`text-[10px] font-bold tracking-wider uppercase text-center ${isLightUser ? (isCompleted ? 'text-[#2563EB]' : 'text-zinc-800') : 'text-white'}`}>
                  {h.label}
                </span>
                {!h.manual && (
                  <span className={`text-[8px] mt-1 uppercase ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>(Auto)</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderProgresso = () => {
    const measurements = [...(challenge.measurements || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return (
      <div className="space-y-4 animate-fade-in pb-20">
        {/* Goal Card */}
        <div className={`border rounded-2xl p-5 ${cardClass}`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2563EB]/20 text-[#2563EB] flex items-center justify-center shrink-0">
              <Target size={20} />
            </div>
            <div>
              <span className={`text-[9px] font-black tracking-widest uppercase ${isLightUser ? 'text-zinc-400' : 'text-white/50'}`}>SUA META</span>
              <p className={`text-sm font-bold mt-1 leading-snug ${isLightUser ? 'text-zinc-800' : 'text-white'}`}>{challenge.goal.description}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Section Header */}
        <div className="flex justify-between items-center px-1">
          <h3 className={`text-[11px] font-black tracking-widest uppercase ${isLightUser ? 'text-zinc-800' : 'text-white'}`}>Evolução</h3>
          <button 
            onClick={() => setShowMeasurementModal(true)}
            className="flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase text-[#2563EB] bg-[#2563EB]/10 px-3 py-1.5 rounded-full"
          >
            <Plus size={12} />
            Nova Medição
          </button>
        </div>

        {measurements.length > 0 ? (
          <>
            {/* Measurements List */}
            <div className="space-y-2">
              {measurements.slice().reverse().map((m, idx) => {
                const isExpanded = expandedDate === m.date;
                const hasDetails = !!(m.peito || m.abdomen || m.pregaTriceps || m.bracoRelaxadoDireito || m.bracoContraidoDireito || m.pernaDireita || m.panturrilhaDireita);

                return (
                  <div 
                    key={m.date} 
                    className={`border rounded-2xl overflow-hidden transition-all duration-300 ${cardClass} ${
                      hasDetails ? 'cursor-pointer hover:border-[#2563EB]/40' : ''
                    }`}
                    onClick={() => {
                      if (hasDetails) {
                        setExpandedDate(isExpanded ? null : m.date);
                      }
                    }}
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <span className={`text-[10px] font-bold ${isLightUser ? 'text-zinc-400' : 'text-white/50'}`}>
                          {new Date(m.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </span>
                        <div className="flex gap-4 mt-1">
                          <div className="flex flex-col">
                            <span className={`text-[9px] uppercase tracking-wider ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>Peso</span>
                            <span className={`text-sm font-bold ${isLightUser ? 'text-zinc-800' : 'text-white'}`}>{m.peso}kg</span>
                          </div>
                          {m.percentualGordura && (
                            <div className="flex flex-col">
                              <span className={`text-[9px] uppercase tracking-wider ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>% Gordura</span>
                              <span className={`text-sm font-bold ${isLightUser ? 'text-zinc-800' : 'text-white'}`}>{m.percentualGordura}%</span>
                            </div>
                          )}
                          {m.cintura && (
                            <div className="flex flex-col">
                              <span className={`text-[9px] uppercase tracking-wider ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>Cintura</span>
                              <span className={`text-sm font-bold ${isLightUser ? 'text-zinc-800' : 'text-white'}`}>{m.cintura}cm</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => {
                        if (hasDetails) {
                          e.stopPropagation();
                          setExpandedDate(isExpanded ? null : m.date);
                        }
                      }}>
                        {idx === measurements.length - 1 && (
                          <span className="text-[8px] font-black tracking-widest uppercase text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">Partida</span>
                        )}
                        {hasDetails && (
                          <span className={`text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded transition-colors ${
                            isExpanded 
                              ? 'bg-[#2563EB]/10 text-[#2563EB]' 
                              : isLightUser ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200' : 'bg-white/5 text-white/70 hover:bg-white/10'
                          }`}>
                            {isExpanded ? 'Ocultar' : 'Detalhes'}
                          </span>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className={`p-4 border-t ${isLightUser ? 'bg-zinc-50 border-zinc-100' : 'bg-black/20 border-white/[0.03]'} space-y-4 text-xs`} onClick={(e) => e.stopPropagation()}>
                        {/* Perímetros Section */}
                        {(m.peito !== undefined || m.abdomen !== undefined || m.bracoRelaxadoDireito !== undefined || m.bracoContraidoDireito !== undefined || m.pernaDireita !== undefined || m.panturrilhaDireita !== undefined) && (
                          <div>
                            <h4 className={`text-[10px] font-black uppercase tracking-wider mb-2 ${isLightUser ? 'text-zinc-950 font-black' : 'text-white'}`}>Perímetros (Circunferências)</h4>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              {m.peito !== undefined && (
                                <div className="flex justify-between py-1 border-b border-dashed border-zinc-200/50 dark:border-white/5">
                                  <span className={isLightUser ? 'text-zinc-500 font-bold' : 'text-zinc-400'}>Peitoral:</span>
                                  <span className={`font-bold ${isLightUser ? 'text-zinc-800' : 'text-zinc-200'}`}>{m.peito.toFixed(2)} cm</span>
                                </div>
                              )}
                              {m.cintura !== undefined && (
                                <div className="flex justify-between py-1 border-b border-dashed border-zinc-200/50 dark:border-white/5">
                                  <span className={isLightUser ? 'text-zinc-500 font-bold' : 'text-zinc-400'}>Cintura:</span>
                                  <span className={`font-bold ${isLightUser ? 'text-zinc-800' : 'text-zinc-200'}`}>{m.cintura.toFixed(2)} cm</span>
                                </div>
                              )}
                              {m.abdomen !== undefined && (
                                <div className="flex justify-between py-1 border-b border-dashed border-zinc-200/50 dark:border-white/5">
                                  <span className={isLightUser ? 'text-zinc-500 font-bold' : 'text-zinc-400'}>Abdômen:</span>
                                  <span className={`font-bold ${isLightUser ? 'text-zinc-800' : 'text-zinc-200'}`}>{m.abdomen.toFixed(2)} cm</span>
                                </div>
                              )}
                              {(m.bracoRelaxadoDireito !== undefined || m.bracoRelaxadoEsquerdo !== undefined) && (
                                <div className="flex justify-between py-1 border-b border-dashed border-zinc-200/50 dark:border-white/5">
                                  <span className={isLightUser ? 'text-zinc-500 font-bold' : 'text-zinc-400'}>Braço relaxado (D/E):</span>
                                  <span className={`font-bold ${isLightUser ? 'text-zinc-800' : 'text-zinc-200'}`}>
                                    {m.bracoRelaxadoDireito?.toFixed(2)} / {m.bracoRelaxadoEsquerdo?.toFixed(2)} cm
                                  </span>
                                </div>
                              )}
                              {(m.bracoContraidoDireito !== undefined || m.bracoContraidoEsquerdo !== undefined) && (
                                <div className="flex justify-between py-1 border-b border-dashed border-zinc-200/50 dark:border-white/5">
                                  <span className={isLightUser ? 'text-zinc-500 font-bold' : 'text-zinc-400'}>Braço contraído (D/E):</span>
                                  <span className={`font-bold ${isLightUser ? 'text-zinc-800' : 'text-zinc-200'}`}>
                                    {m.bracoContraidoDireito?.toFixed(2)} / {m.bracoContraidoEsquerdo?.toFixed(2)} cm
                                  </span>
                                </div>
                              )}
                              {(m.pernaDireita !== undefined || m.pernaEsquerda !== undefined) && (
                                <div className="flex justify-between py-1 border-b border-dashed border-zinc-200/50 dark:border-white/5">
                                  <span className={isLightUser ? 'text-zinc-500 font-bold' : 'text-zinc-400'}>Coxa (D/E):</span>
                                  <span className={`font-bold ${isLightUser ? 'text-zinc-800' : 'text-zinc-200'}`}>
                                    {m.pernaDireita?.toFixed(2)} / {m.pernaEsquerda?.toFixed(2)} cm
                                  </span>
                                </div>
                              )}
                              {(m.panturrilhaDireita !== undefined || m.panturrilhaEsquerda !== undefined) && (
                                <div className="flex justify-between py-1 border-b border-dashed border-zinc-200/50 dark:border-white/5">
                                  <span className={isLightUser ? 'text-zinc-500 font-bold' : 'text-zinc-400'}>Panturrilha (D/E):</span>
                                  <span className={`font-bold ${isLightUser ? 'text-zinc-800' : 'text-zinc-200'}`}>
                                    {m.panturrilhaDireita?.toFixed(2)} / {m.panturrilhaEsquerda?.toFixed(2)} cm
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Pregas Cutâneas Section */}
                        {(m.pregaTriceps !== undefined || m.pregaAxilarMedia !== undefined || m.pregaTorax !== undefined || m.pregaAbdominal !== undefined || m.pregaSuprailiaca !== undefined || m.pregaSubescapular !== undefined || m.pregaCoxa !== undefined) && (
                          <div>
                            <h4 className={`text-[10px] font-black uppercase tracking-wider mb-2 ${isLightUser ? 'text-zinc-950 font-black' : 'text-white'}`}>Pregas Cutâneas</h4>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              {m.pregaTriceps !== undefined && (
                                <div className="flex justify-between py-1 border-b border-dashed border-zinc-200/50 dark:border-white/5">
                                  <span className={isLightUser ? 'text-zinc-500 font-bold' : 'text-zinc-400'}>Tríceps:</span>
                                  <span className={`font-bold ${isLightUser ? 'text-zinc-800' : 'text-zinc-200'}`}>{m.pregaTriceps.toFixed(2)} mm</span>
                                </div>
                              )}
                              {m.pregaAxilarMedia !== undefined && (
                                <div className="flex justify-between py-1 border-b border-dashed border-zinc-200/50 dark:border-white/5">
                                  <span className={isLightUser ? 'text-zinc-500 font-bold' : 'text-zinc-400'}>Axilar Média:</span>
                                  <span className={`font-bold ${isLightUser ? 'text-zinc-800' : 'text-zinc-200'}`}>{m.pregaAxilarMedia.toFixed(2)} mm</span>
                                </div>
                              )}
                              {m.pregaTorax !== undefined && (
                                <div className="flex justify-between py-1 border-b border-dashed border-zinc-200/50 dark:border-white/5">
                                  <span className={isLightUser ? 'text-zinc-500 font-bold' : 'text-zinc-400'}>Tórax:</span>
                                  <span className={`font-bold ${isLightUser ? 'text-zinc-800' : 'text-zinc-200'}`}>{m.pregaTorax.toFixed(2)} mm</span>
                                </div>
                              )}
                              {m.pregaAbdominal !== undefined && (
                                <div className="flex justify-between py-1 border-b border-dashed border-zinc-200/50 dark:border-white/5">
                                  <span className={isLightUser ? 'text-zinc-500 font-bold' : 'text-zinc-400'}>Abdominal:</span>
                                  <span className={`font-bold ${isLightUser ? 'text-zinc-800' : 'text-zinc-200'}`}>{m.pregaAbdominal.toFixed(2)} mm</span>
                                </div>
                              )}
                              {m.pregaSuprailiaca !== undefined && (
                                <div className="flex justify-between py-1 border-b border-dashed border-zinc-200/50 dark:border-white/5">
                                  <span className={isLightUser ? 'text-zinc-500 font-bold' : 'text-zinc-400'}>Suprailíaca:</span>
                                  <span className={`font-bold ${isLightUser ? 'text-zinc-800' : 'text-zinc-200'}`}>{m.pregaSuprailiaca.toFixed(2)} mm</span>
                                </div>
                              )}
                              {m.pregaSubescapular !== undefined && (
                                <div className="flex justify-between py-1 border-b border-dashed border-zinc-200/50 dark:border-white/5">
                                  <span className={isLightUser ? 'text-zinc-500 font-bold' : 'text-zinc-400'}>Subescapular:</span>
                                  <span className={`font-bold ${isLightUser ? 'text-zinc-800' : 'text-zinc-200'}`}>{m.pregaSubescapular.toFixed(2)} mm</span>
                                </div>
                              )}
                              {m.pregaCoxa !== undefined && (
                                <div className="flex justify-between py-1 border-b border-dashed border-zinc-200/50 dark:border-white/5">
                                  <span className={isLightUser ? 'text-zinc-500 font-bold' : 'text-zinc-400'}>Coxa:</span>
                                  <span className={`font-bold ${isLightUser ? 'text-zinc-800' : 'text-zinc-200'}`}>{m.pregaCoxa.toFixed(2)} mm</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {m.observacao && (
                          <div className={`text-[10px] italic p-2 rounded ${isLightUser ? 'bg-zinc-100 text-zinc-600 font-medium' : 'bg-white/5 text-white/50'}`}>
                            * {m.observacao}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className={`border rounded-2xl p-8 text-center ${cardClass} ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>
            <Scale size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma medição registrada.</p>
          </div>
        )}
      </div>
    );
  };

  const renderHistorico = () => {
    const days = [];
    const today = new Date(getLocalToday());
    
    // Fill up to 35 days (5 weeks)
    for (let i = 34; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const check = challenge.dailyChecks?.find(c => c.date === dateStr);
      let score = 0;
      if (check) {
        HABITS.forEach(h => { if (check[h.key]) score++; });
      }
      days.push({ date: dateStr, score });
    }

    return (
      <div className="space-y-4 animate-fade-in pb-20">
        <div className={`border rounded-2xl p-5 ${cardClass}`}>
          <h3 className={`text-[11px] font-black tracking-widest uppercase mb-4 ${isLightUser ? 'text-zinc-800' : 'text-white'}`}>Últimos 35 dias</h3>
          <div className="grid grid-cols-7 gap-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <div key={i} className={`text-center text-[9px] font-bold ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>{d}</div>
            ))}
            {days.map((d, i) => {
              let bgClass = isLightUser ? 'bg-zinc-100 text-zinc-400' : 'bg-white/5 text-white/40';
              if (d.score === 1) bgClass = 'bg-[#2563EB]/20 text-[#2563EB]';
              else if (d.score === 2) bgClass = 'bg-[#2563EB]/40 text-[#2563EB] font-black';
              else if (d.score === 3 || d.score === 4) bgClass = 'bg-[#2563EB]/60 text-white';
              else if (d.score === 5) bgClass = 'bg-[#2563EB]/80 text-white';
              else if (d.score === 6) bgClass = 'bg-[#2563EB] text-white';

              return (
                <div 
                  key={d.date} 
                  title={`${d.date}: ${d.score} hábitos`}
                  className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-bold ${bgClass}`}
                >
                  {new Date(d.date).getUTCDate()}
                </div>
              );
            })}
          </div>
          <div className={`flex justify-between items-center mt-4 text-[9px] font-bold uppercase tracking-widest ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>
            <span>Menos</span>
            <div className="flex gap-1">
              <div className={`w-3 h-3 rounded ${isLightUser ? 'bg-zinc-100' : 'bg-white/5'}`}></div>
              <div className="w-3 h-3 rounded bg-[#2563EB]/40"></div>
              <div className="w-3 h-3 rounded bg-[#2563EB]/80"></div>
              <div className="w-3 h-3 rounded bg-[#2563EB]"></div>
            </div>
            <span>Mais</span>
          </div>
        </div>
      </div>
    );
  };

  const renderComparativo = () => {
    const hStats = getStats(henrique);
    const jStats = getStats(jessica);

    return (
      <div className="space-y-4 animate-fade-in pb-20">
        {/* Compare Card */}
        <div className={`border rounded-2xl p-5 space-y-5 ${cardClass}`}>
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={16} className="text-yellow-500" />
            <h3 className={`text-[11px] font-black tracking-widest uppercase ${isLightUser ? 'text-zinc-800' : 'text-white'}`}>Desempenho Geral</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Henrique */}
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 font-black ${isLightUser ? 'bg-zinc-100 text-zinc-800 border border-zinc-200' : 'bg-zinc-800 text-white'}`}>HE</div>
              <span className={`text-xs font-bold ${isLightUser ? 'text-zinc-800' : 'text-white'}`}>Henrique</span>
              <div className="mt-2 space-y-1">
                <div className={`rounded-lg py-2 ${isLightUser ? 'bg-zinc-50 border border-zinc-100' : 'bg-white/5'}`}>
                  <span className="block text-xl font-black text-[#2563EB]">{hStats.streak}</span>
                  <span className={`text-[8px] uppercase tracking-wider ${isLightUser ? 'text-zinc-400' : 'text-white/50'}`}>Streak atual</span>
                </div>
                <div className={`rounded-lg py-2 ${isLightUser ? 'bg-zinc-50 border border-zinc-100' : 'bg-white/5'}`}>
                  <span className={`block text-xl font-black ${isLightUser ? 'text-zinc-800' : 'text-white'}`}>{hStats.percentCompleted}%</span>
                  <span className={`text-[8px] uppercase tracking-wider ${isLightUser ? 'text-zinc-400' : 'text-white/50'}`}>Cumprimento</span>
                </div>
              </div>
            </div>

            {/* Jessica */}
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 font-black ${isLightUser ? 'bg-zinc-100 text-zinc-800 border border-zinc-200' : 'bg-zinc-800 text-white'}`}>JE</div>
              <span className={`text-xs font-bold ${isLightUser ? 'text-zinc-800' : 'text-white'}`}>Jéssica</span>
              <div className="mt-2 space-y-1">
                <div className={`rounded-lg py-2 ${isLightUser ? 'bg-zinc-50 border border-zinc-100' : 'bg-white/5'}`}>
                  <span className="block text-xl font-black text-[#2563EB]">{jStats.streak}</span>
                  <span className={`text-[8px] uppercase tracking-wider ${isLightUser ? 'text-zinc-400' : 'text-white/50'}`}>Streak atual</span>
                </div>
                <div className={`rounded-lg py-2 ${isLightUser ? 'bg-zinc-50 border border-zinc-100' : 'bg-white/5'}`}>
                  <span className={`block text-xl font-black ${isLightUser ? 'text-zinc-800' : 'text-white'}`}>{jStats.percentCompleted}%</span>
                  <span className={`text-[8px] uppercase tracking-wider ${isLightUser ? 'text-zinc-400' : 'text-white/50'}`}>Cumprimento</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Challenge Goals */}
        <div className={`border rounded-2xl p-5 ${cardClass}`}>
          <h3 className={`text-[11px] font-black tracking-widest uppercase mb-4 ${isLightUser ? 'text-zinc-800' : 'text-white'}`}>Metas do Desafio</h3>
          <div className="space-y-3">
            <div className={`rounded-xl p-3 ${isLightUser ? 'bg-zinc-50 border border-zinc-150' : 'bg-white/5'}`}>
              <span className={`text-[9px] uppercase tracking-wider font-bold block mb-1 ${isLightUser ? 'text-zinc-400' : 'text-white/50'}`}>Henrique</span>
              <p className={`text-sm font-medium ${isLightUser ? 'text-zinc-800' : 'text-white'}`}>{henrique?.challenge90?.goal?.description || '-'}</p>
            </div>
            <div className={`rounded-xl p-3 ${isLightUser ? 'bg-zinc-50 border border-zinc-150' : 'bg-white/5'}`}>
              <span className={`text-[9px] uppercase tracking-wider font-bold block mb-1 ${isLightUser ? 'text-zinc-400' : 'text-white/50'}`}>Jéssica</span>
              <p className={`text-sm font-medium ${isLightUser ? 'text-zinc-800' : 'text-white'}`}>{jessica?.challenge90?.goal?.description || '-'}</p>
            </div>
          </div>
        </div>

        <p className={`text-[9px] text-center italic mt-6 px-4 ${isLightUser ? 'text-zinc-400 font-bold' : 'text-white/40'}`}>
          A avaliação final do desafio será feita pela nutricionista Karine Calixto com base nesses dados.
        </p>
      </div>
    );
  };

  const autoCalculateBodyFat = () => {
    const age = user.age || 26;
    const gender = user.sex || 'masculino';
    
    const triceps = parseFloat(String(measurementForm.pregaTriceps || 0)) || 0;
    const axilar = parseFloat(String(measurementForm.pregaAxilarMedia || 0)) || 0;
    const torax = parseFloat(String(measurementForm.pregaTorax || 0)) || 0;
    const abdominal = parseFloat(String(measurementForm.pregaAbdominal || 0)) || 0;
    const supra = parseFloat(String(measurementForm.pregaSuprailiaca || 0)) || 0;
    const sub = parseFloat(String(measurementForm.pregaSubescapular || 0)) || 0;
    const coxa = parseFloat(String(measurementForm.pregaCoxa || 0)) || 0;
    
    const sum = triceps + axilar + torax + abdominal + supra + sub + coxa;
    if (sum === 0) return;
    
    let bd = 1.0;
    if (gender === 'masculino') {
      bd = 1.112 - (0.00043499 * sum) + (0.00000055 * sum * sum) - (0.00028826 * age);
    } else {
      bd = 1.097 - (0.00046971 * sum) + (0.00000056 * sum * sum) - (0.00012828 * age);
    }
    
    const bf = (4.95 / bd - 4.50) * 100;
    setMeasurementForm(prev => ({
      ...prev,
      percentualGordura: parseFloat(bf.toFixed(2))
    }));
  };

  const handleSaveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (measurementForm.peso) {
      const payload: BodyMeasurement = {
        date: measurementForm.date || getLocalToday(),
        peso: measurementForm.peso,
        percentualGordura: measurementForm.percentualGordura,
        cintura: measurementForm.cintura,
        peito: measurementForm.peito,
        abdomen: measurementForm.abdomen,
        panturrilhaDireita: measurementForm.panturrilhaDireita,
        panturrilhaEsquerda: measurementForm.panturrilhaEsquerda,
        pernaDireita: measurementForm.pernaDireita,
        pernaEsquerda: measurementForm.pernaEsquerda,
        coxaDireita: measurementForm.coxaDireita,
        coxaEsquerda: measurementForm.coxaEsquerda,
        bracoRelaxadoDireito: measurementForm.bracoRelaxadoDireito,
        bracoRelaxadoEsquerdo: measurementForm.bracoRelaxadoEsquerdo,
        bracoContraidoDireito: measurementForm.bracoContraidoDireito,
        bracoContraidoEsquerdo: measurementForm.bracoContraidoEsquerdo,
        pregaTriceps: measurementForm.pregaTriceps,
        pregaAxilarMedia: measurementForm.pregaAxilarMedia,
        pregaTorax: measurementForm.pregaTorax,
        pregaAbdominal: measurementForm.pregaAbdominal,
        pregaSuprailiaca: measurementForm.pregaSuprailiaca,
        pregaSubescapular: measurementForm.pregaSubescapular,
        pregaCoxa: measurementForm.pregaCoxa,
        observacao: measurementForm.observacao
      };
      
      addMeasurement(payload);
      setShowMeasurementModal(false);
      setMeasurementForm({});
      setShowAdvancedFields(false);
    }
  };

  return (
    <div className={`w-full min-h-screen flex flex-col bg-transparent select-none font-sans ${isLightUser ? 'text-zinc-950 bg-transparent' : 'text-white'}`}>
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-2">
          <Target className="text-[#2563EB]" size={28} />
          Desafio 90
        </h1>
        <p className={`text-sm font-medium ${isLightUser ? 'text-zinc-500' : 'text-white/50'}`}>Transformação em andamento</p>
      </div>

      {/* Sub tabs nav bar */}
      <div className="px-4 mb-6">
        <div className={`flex p-1 rounded-xl ${isLightUser ? 'bg-zinc-200/50' : 'bg-white/5'}`}>
          {(['hoje', 'progresso', 'historico', 'comparativo'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`flex-1 py-2 text-[10px] font-black tracking-widest uppercase rounded-lg transition-all ${
                activeSubTab === tab 
                  ? 'bg-[#2563EB] text-white shadow-md' 
                  : isLightUser 
                    ? 'text-zinc-500 hover:text-zinc-800' 
                    : 'text-white/50 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="px-4 flex-1">
        {activeSubTab === 'hoje' && renderHoje()}
        {activeSubTab === 'progresso' && renderProgresso()}
        {activeSubTab === 'historico' && renderHistorico()}
        {activeSubTab === 'comparativo' && renderComparativo()}
      </div>

      {/* New Measurement Modal */}
      <AnimatePresence>
        {showMeasurementModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`w-full max-w-md rounded-[24px] border p-6 max-h-[85vh] overflow-y-auto ${
                isLightUser 
                  ? 'bg-white border-zinc-200 shadow-xl text-zinc-900' 
                  : 'bg-[#1A1A1A] border-white/10 text-white'
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black uppercase italic tracking-tight">Nova Medição</h2>
                <button 
                  type="button"
                  onClick={() => {
                    setShowMeasurementModal(false);
                    setMeasurementForm({});
                    setShowAdvancedFields(false);
                  }} 
                  className={`p-2 rounded-full ${isLightUser ? 'text-zinc-500 hover:text-zinc-800 bg-zinc-100' : 'text-white/50 hover:text-white bg-white/5'}`}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveMeasurement} className="space-y-4">
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-500' : 'text-white/50'}`}>Data</label>
                  <input 
                    type="date" 
                    required
                    value={measurementForm.date || getLocalToday()}
                    onChange={e => setMeasurementForm({...measurementForm, date: e.target.value})}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] ${
                      isLightUser ? 'bg-zinc-50 border-zinc-250 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-500' : 'text-white/50'}`}>Peso (kg)*</label>
                    <input 
                      type="number" step="0.1" required
                      value={measurementForm.peso || ''}
                      onChange={e => setMeasurementForm({...measurementForm, peso: parseFloat(e.target.value)})}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] ${
                        isLightUser ? 'bg-zinc-50 border-zinc-250 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-500' : 'text-white/50'}`}>% Gordura</label>
                    <input 
                      type="number" step="0.1"
                      value={measurementForm.percentualGordura || ''}
                      onChange={e => setMeasurementForm({...measurementForm, percentualGordura: parseFloat(e.target.value)})}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] ${
                        isLightUser ? 'bg-zinc-50 border-zinc-250 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-500' : 'text-white/50'}`}>Cintura (cm)</label>
                  <input 
                    type="number" step="0.1"
                    value={measurementForm.cintura || ''}
                    onChange={e => setMeasurementForm({...measurementForm, cintura: parseFloat(e.target.value)})}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] ${
                      isLightUser ? 'bg-zinc-50 border-zinc-250 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>

                {/* Advanced Toggle Button */}
                <div className="pt-2 border-t border-dashed border-zinc-250/50 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                    className="w-full flex items-center justify-between text-[10px] font-black tracking-widest uppercase text-[#2563EB] bg-[#2563EB]/10 py-2 px-4 rounded-xl hover:bg-[#2563EB]/15 transition-all"
                  >
                    <span>{showAdvancedFields ? 'Ocultar Opcionais' : '+ Pregas e Perímetros'}</span>
                    <span className="text-xs">{showAdvancedFields ? '▲' : '▼'}</span>
                  </button>
                </div>

                {showAdvancedFields && (
                  <div className="space-y-4 pt-2 border-t border-dashed border-zinc-250/50 dark:border-white/5 animate-fade-in">
                    
                    {/* Perímetros Section */}
                    <div>
                      <h4 className={`text-[10px] font-black uppercase tracking-wider mb-2 ${isLightUser ? 'text-zinc-600' : 'text-white/60'}`}>Perímetros (cm)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>Peitoral</label>
                          <input 
                            type="number" step="0.1"
                            value={measurementForm.peito || ''}
                            onChange={e => setMeasurementForm({...measurementForm, peito: parseFloat(e.target.value)})}
                            className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] ${
                              isLightUser ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>Abdômen</label>
                          <input 
                            type="number" step="0.1"
                            value={measurementForm.abdomen || ''}
                            onChange={e => setMeasurementForm({...measurementForm, abdomen: parseFloat(e.target.value)})}
                            className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] ${
                              isLightUser ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>Braço Relax. D</label>
                          <input 
                            type="number" step="0.1"
                            value={measurementForm.bracoRelaxadoDireito || ''}
                            onChange={e => setMeasurementForm({...measurementForm, bracoRelaxadoDireito: parseFloat(e.target.value)})}
                            className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] ${
                              isLightUser ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>Braço Relax. E</label>
                          <input 
                            type="number" step="0.1"
                            value={measurementForm.bracoRelaxadoEsquerdo || ''}
                            onChange={e => setMeasurementForm({...measurementForm, bracoRelaxadoEsquerdo: parseFloat(e.target.value)})}
                            className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] ${
                              isLightUser ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>Braço Contr. D</label>
                          <input 
                            type="number" step="0.1"
                            value={measurementForm.bracoContraidoDireito || ''}
                            onChange={e => setMeasurementForm({...measurementForm, bracoContraidoDireito: parseFloat(e.target.value)})}
                            className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] ${
                              isLightUser ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>Braço Contr. E</label>
                          <input 
                            type="number" step="0.1"
                            value={measurementForm.bracoContraidoEsquerdo || ''}
                            onChange={e => setMeasurementForm({...measurementForm, bracoContraidoEsquerdo: parseFloat(e.target.value)})}
                            className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] ${
                              isLightUser ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>Coxa Direita</label>
                          <input 
                            type="number" step="0.1"
                            value={measurementForm.pernaDireita || ''}
                            onChange={e => setMeasurementForm({
                              ...measurementForm, 
                              pernaDireita: parseFloat(e.target.value),
                              coxaDireita: parseFloat(e.target.value)
                            })}
                            className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] ${
                              isLightUser ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>Coxa Esquerda</label>
                          <input 
                            type="number" step="0.1"
                            value={measurementForm.pernaEsquerda || ''}
                            onChange={e => setMeasurementForm({
                              ...measurementForm, 
                              pernaEsquerda: parseFloat(e.target.value),
                              coxaEsquerda: parseFloat(e.target.value)
                            })}
                            className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] ${
                              isLightUser ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>Panturrilha D</label>
                          <input 
                            type="number" step="0.1"
                            value={measurementForm.panturrilhaDireita || ''}
                            onChange={e => setMeasurementForm({...measurementForm, panturrilhaDireita: parseFloat(e.target.value)})}
                            className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] ${
                              isLightUser ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>Panturrilha E</label>
                          <input 
                            type="number" step="0.1"
                            value={measurementForm.panturrilhaEsquerda || ''}
                            onChange={e => setMeasurementForm({...measurementForm, panturrilhaEsquerda: parseFloat(e.target.value)})}
                            className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] ${
                              isLightUser ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pregas Cutâneas Section */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className={`text-[10px] font-black uppercase tracking-wider ${isLightUser ? 'text-zinc-600' : 'text-white/60'}`}>Pregas Cutâneas (mm)</h4>
                        <button
                          type="button"
                          onClick={autoCalculateBodyFat}
                          className="text-[9px] font-black tracking-widest uppercase bg-[#2563EB] text-white px-2 py-1 rounded hover:brightness-110 transition-all"
                        >
                          Calcular BF%
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>Tríceps</label>
                          <input 
                            type="number" step="0.1"
                            value={measurementForm.pregaTriceps || ''}
                            onChange={e => setMeasurementForm({...measurementForm, pregaTriceps: parseFloat(e.target.value)})}
                            className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] ${
                              isLightUser ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>Axilar Média</label>
                          <input 
                            type="number" step="0.1"
                            value={measurementForm.pregaAxilarMedia || ''}
                            onChange={e => setMeasurementForm({...measurementForm, pregaAxilarMedia: parseFloat(e.target.value)})}
                            className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] ${
                              isLightUser ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>Tórax</label>
                          <input 
                            type="number" step="0.1"
                            value={measurementForm.pregaTorax || ''}
                            onChange={e => setMeasurementForm({...measurementForm, pregaTorax: parseFloat(e.target.value)})}
                            className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] ${
                              isLightUser ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>Abdominal</label>
                          <input 
                            type="number" step="0.1"
                            value={measurementForm.pregaAbdominal || ''}
                            onChange={e => setMeasurementForm({...measurementForm, pregaAbdominal: parseFloat(e.target.value)})}
                            className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] ${
                              isLightUser ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>Suprailíaca</label>
                          <input 
                            type="number" step="0.1"
                            value={measurementForm.pregaSuprailiaca || ''}
                            onChange={e => setMeasurementForm({...measurementForm, pregaSuprailiaca: parseFloat(e.target.value)})}
                            className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] ${
                              isLightUser ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>Subescapular</label>
                          <input 
                            type="number" step="0.1"
                            value={measurementForm.pregaSubescapular || ''}
                            onChange={e => setMeasurementForm({...measurementForm, pregaSubescapular: parseFloat(e.target.value)})}
                            className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] ${
                              isLightUser ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>Coxa</label>
                          <input 
                            type="number" step="0.1"
                            value={measurementForm.pregaCoxa || ''}
                            onChange={e => setMeasurementForm({...measurementForm, pregaCoxa: parseFloat(e.target.value)})}
                            className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] ${
                              isLightUser ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-white/5 border-white/10 text-white'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Observação Section */}
                    <div>
                      <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${isLightUser ? 'text-zinc-400' : 'text-white/40'}`}>Observação / Notas</label>
                      <input 
                        type="text"
                        value={measurementForm.observacao || ''}
                        onChange={e => setMeasurementForm({...measurementForm, observacao: e.target.value})}
                        placeholder="Ex: Pós-treino, jejum, etc."
                        className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] ${
                          isLightUser ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400' : 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                        }`}
                      />
                    </div>
                  </div>
                )}

                <button type="submit" className="w-full h-12 mt-4 bg-[#2563EB] text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:brightness-110 transition-all">
                  Salvar
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
