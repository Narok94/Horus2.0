import React, { useState } from 'react';
import { useStore } from '../../store';
import { Utensils, Info, Check, Clock, ChevronDown, ChevronUp, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DietView: React.FC = () => {
  const { user, toggleMealComplete, theme } = useStore();
  const dietPlan = user?.dietPlan;

  const isLightUser = user?.username.toLowerCase() === 'henrique' || theme === 'light';

  // Manual toggle state for collapsing/expanding individual meals
  // If undefined, defaults to !isCompleted (completed meals are minimized)
  const [userToggles, setUserToggles] = useState<Record<string, boolean>>({});
  // Toggle state for nutritional guidelines header
  const [showGuidelines, setShowGuidelines] = useState(false);
  // Toggle state for detailed notes inside meals
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  // Toggle state for embedded substitutions
  const [expandedSubs, setExpandedSubs] = useState<Record<string, boolean>>({});

  const handleVibrate = (ms = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  if (!dietPlan) {
    return (
      <div className={`w-full min-h-screen flex flex-col justify-start pt-12 sm:pt-6 pb-32 bg-transparent select-none font-sans ${isLightUser ? 'text-zinc-950 font-black' : 'text-white'}`}>
        <header className={`flex items-center justify-between py-2 px-2 border-b shrink-0 ${isLightUser ? 'border-zinc-200' : 'border-white/5'}`}>
          <div>
            <h1 className={`text-xl font-black tracking-tighter uppercase leading-none ${isLightUser ? 'text-zinc-950' : 'text-white'}`}>Sua <span className={isLightUser ? 'text-[#2563EB]' : 'text-emerald-400'}>Dieta</span></h1>
            <p className={`${isLightUser ? 'text-zinc-500 font-bold' : 'text-white/40'} uppercase tracking-widest mt-1 text-[8px] font-mono`}>Plano Alimentar.</p>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-12">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-zinc-500 mb-3">
            <Utensils size={20} />
          </div>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.15em]">Nenhum plano alimentar cadastrado.</p>
        </div>
      </div>
    );
  }

  // Calculate completed meals today
  const tzOffset = (new Date()).getTimezoneOffset() * 60000;
  const today = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
  const completedToday = user?.completedMeals?.[today] || [];
  
  const totalMeals = dietPlan.meals.length;
  const completedCount = dietPlan.meals.filter(m => completedToday.includes(m.id)).length;
  const progressPercent = totalMeals > 0 ? Math.round((completedCount / totalMeals) * 100) : 0;

  const handleMealCheck = (mealId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleVibrate(20);
    const isCurrentlyCompleted = completedToday.includes(mealId);
    toggleMealComplete(mealId);

    // Auto minimize if checking as done, expand if unchecking
    setUserToggles(prev => ({
      ...prev,
      [mealId]: isCurrentlyCompleted // if it was completed, it becomes uncompleted -> expand (true). Otherwise minimize (false).
    }));
  };

  const toggleMealExpand = (mealId: string) => {
    handleVibrate(10);
    const isCompleted = completedToday.includes(mealId);
    const currentlyExpanded = userToggles[mealId] !== undefined ? userToggles[mealId] : !isCompleted;
    setUserToggles(prev => ({
      ...prev,
      [mealId]: !currentlyExpanded
    }));
  };

  return (
    <div className={`w-full min-h-screen flex flex-col justify-start pt-12 sm:pt-6 pb-32 bg-transparent select-none font-sans ${isLightUser ? 'text-zinc-950' : 'text-white'}`}>
      
      {/* Header */}
      <header className={`flex items-center justify-between py-2 px-1.5 border-b shrink-0 ${isLightUser ? 'border-zinc-200' : 'border-white/10'}`}>
        <div>
          <h1 className={`text-xl font-black tracking-tighter uppercase leading-none ${isLightUser ? 'text-zinc-950' : 'text-white'}`}>
            Sua <span className={isLightUser ? 'text-[#2563EB]' : 'text-emerald-400'}>Dieta</span>
          </h1>
          <p className={`${isLightUser ? 'text-zinc-500 font-bold' : 'text-zinc-400'} uppercase tracking-widest mt-1 text-[8.5px] font-mono flex items-center gap-1`}>
            <span>Nutricionista: {dietPlan.nutritionist.name}</span>
          </p>
        </div>

        <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1.5 ${
          progressPercent === 100 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
            : (isLightUser ? 'bg-zinc-100 border-zinc-200 text-zinc-700' : 'bg-zinc-900 border-zinc-800 text-zinc-300')
        }`}>
          <Sparkles size={11} className={progressPercent === 100 ? 'text-emerald-500' : 'text-amber-400'} />
          <span>{completedCount}/{totalMeals} Feito</span>
        </div>
      </header>

      <div className="px-1.5 mt-3 space-y-3">
        
        {/* Progress & Quick Guidelines Bar */}
        <div className={`rounded-xl p-3 border transition-all ${
          isLightUser ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-900/60 border-zinc-800'
        }`}>
          {/* Progress row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-black uppercase tracking-tight ${isLightUser ? 'text-zinc-800' : 'text-zinc-200'}`}>
                Progresso Diário
              </span>
              <span className="text-[10px] font-mono text-emerald-500 font-bold">
                {progressPercent}%
              </span>
            </div>
            
            <button
              onClick={() => { handleVibrate(10); setShowGuidelines(!showGuidelines); }}
              className={`text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
                isLightUser 
                  ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100' 
                  : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <Info size={11} className={isLightUser ? 'text-[#2563EB]' : 'text-emerald-400'} />
              <span>{showGuidelines ? 'Ocultar Orientações' : 'Orientações'}</span>
              {showGuidelines ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          </div>

          {/* Clean Progress Bar */}
          <div className={`w-full h-2 rounded-full overflow-hidden ${isLightUser ? 'bg-zinc-100' : 'bg-zinc-800'}`}>
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          {/* Collapsible Guidelines details */}
          <AnimatePresence>
            {showGuidelines && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className={`mt-3 pt-2.5 border-t text-[11px] leading-relaxed space-y-1.5 ${
                  isLightUser ? 'border-zinc-200 text-zinc-700' : 'border-zinc-800/80 text-zinc-300'
                }`}>
                  <p className="font-semibold">{dietPlan.generalGuidelines}</p>
                  <div className="flex flex-wrap gap-2 pt-1 text-[9px] font-mono text-zinc-500">
                    <span>CRN: {dietPlan.nutritionist.crn}</span>
                    <span>•</span>
                    <span>{dietPlan.nutritionist.contact}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* List of Meals */}
        <div className="space-y-2">
          {dietPlan.meals.map((meal) => {
            const isCompleted = completedToday.includes(meal.id);
            const isExpanded = userToggles[meal.id] !== undefined ? userToggles[meal.id] : !isCompleted;
            
            // Find if there is a substitution matching this meal
            const relatedSub = dietPlan.substitutions?.find(s => 
              s.name.toLowerCase().includes(meal.name.toLowerCase()) || 
              (meal.id === 'cafe-manha' && s.name.toLowerCase().includes('café')) ||
              (meal.id === 'lanche-tarde' && s.name.toLowerCase().includes('lanche'))
            );

            const isSubOpen = !!expandedSubs[meal.id];
            const isNoteOpen = !!expandedNotes[meal.id];

            return (
              <motion.div 
                key={meal.id} 
                layout
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isCompleted 
                    ? (isLightUser 
                        ? 'bg-emerald-50/70 border-emerald-300/60 shadow-none' 
                        : 'bg-emerald-950/20 border-emerald-500/25 shadow-none')
                    : (isLightUser 
                        ? 'bg-white border-zinc-200 shadow-sm hover:border-zinc-300' 
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-750')
                }`}
              >
                {/* Header Row (Clicking header toggles expand/collapse) */}
                <div 
                  onClick={() => toggleMealExpand(meal.id)}
                  className={`flex items-center justify-between p-3 cursor-pointer select-none gap-2 ${
                    isExpanded && !isCompleted ? (isLightUser ? 'border-b border-zinc-100' : 'border-b border-zinc-800/50') : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Time Pill */}
                    <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : (isLightUser ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-800 text-zinc-400')
                    }`}>
                      <Clock size={10} className="inline mr-1 -mt-0.5" />
                      {meal.time}
                    </span>

                    {/* Meal Name */}
                    <div className="flex flex-col min-w-0">
                      <span className={`text-xs font-bold uppercase tracking-tight truncate ${
                        isCompleted 
                          ? (isLightUser ? 'text-emerald-800 line-through opacity-80' : 'text-emerald-400 line-through opacity-80') 
                          : (isLightUser ? 'text-zinc-900' : 'text-zinc-100')
                      }`}>
                        {meal.name}
                      </span>

                      {/* If minimized, show a summary preview of items */}
                      {!isExpanded && (
                        <span className={`text-[10px] truncate ${
                          isCompleted ? 'text-emerald-600/70 dark:text-emerald-400/60' : 'text-zinc-500'
                        }`}>
                          {meal.items.map(i => i.food).join(' • ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status badge when minimized & completed */}
                    {isCompleted && !isExpanded && (
                      <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Concluída
                      </span>
                    )}

                    {/* Checkbox button */}
                    <button 
                      onClick={(e) => handleMealCheck(meal.id, e)}
                      title={isCompleted ? "Marcar como pendente" : "Marcar como feita"}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all duration-200 shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm scale-105'
                          : (isLightUser 
                              ? 'bg-zinc-50 border-zinc-300 text-transparent hover:border-emerald-500' 
                              : 'bg-zinc-950 border-zinc-700 text-transparent hover:border-emerald-500')
                      }`}
                    >
                      <Check size={14} className={isCompleted ? 'opacity-100' : 'opacity-0'} />
                    </button>

                    {/* Chevron expand icon */}
                    <div className={`p-1 rounded text-zinc-400 hover:text-zinc-200 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>

                {/* Expanded Meal Details */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className={`p-3 pt-2.5 space-y-2.5 ${
                        isCompleted ? (isLightUser ? 'bg-emerald-50/40' : 'bg-emerald-950/10') : ''
                      }`}>
                        {/* Ingredient list */}
                        <div className="space-y-1.5">
                          {meal.items.map((item, idx) => (
                            <div key={idx} className="flex flex-col text-[11px]">
                              <div className="flex items-start justify-between gap-2">
                                <span className={`font-semibold leading-tight flex items-center gap-1.5 ${
                                  isCompleted 
                                    ? (isLightUser ? 'text-emerald-900' : 'text-emerald-200') 
                                    : (isLightUser ? 'text-zinc-800' : 'text-zinc-200')
                                }`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 shrink-0 mt-1" />
                                  {item.food}
                                </span>

                                {item.quantity && (
                                  <span className={`text-[10px] font-mono font-bold tracking-wider shrink-0 bg-zinc-500/10 px-1.5 py-0.5 rounded ${
                                    isCompleted 
                                      ? 'text-emerald-600 dark:text-emerald-400' 
                                      : (isLightUser ? 'text-zinc-600' : 'text-zinc-400')
                                  }`}>
                                    {item.quantity}
                                  </span>
                                )}
                              </div>

                              {/* Alternative options if present */}
                              {item.alternatives && item.alternatives.length > 0 && (
                                <div className={`text-[9.5px] italic pl-3 mt-0.5 ${
                                  isCompleted ? 'text-emerald-700/70 dark:text-emerald-400/60' : 'text-zinc-500'
                                }`}>
                                  ou: {item.alternatives.join(' / ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Short Obs or Expandable Long Notes */}
                        {meal.obs && (
                          <div className={`pt-2 border-t ${
                            isCompleted 
                              ? (isLightUser ? 'border-emerald-200' : 'border-emerald-800/30') 
                              : (isLightUser ? 'border-zinc-100' : 'border-zinc-800/60')
                          }`}>
                            {meal.obs.length < 50 ? (
                              <p className={`text-[10px] font-medium italic ${
                                isLightUser ? 'text-zinc-600' : 'text-zinc-400'
                              }`}>
                                <span className="font-bold not-italic text-emerald-500">Dica:</span> {meal.obs}
                              </p>
                            ) : (
                              <div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVibrate(10);
                                    setExpandedNotes(prev => ({ ...prev, [meal.id]: !prev[meal.id] }));
                                  }}
                                  className={`text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                    isLightUser ? 'text-[#2563EB] hover:underline' : 'text-emerald-400 hover:underline'
                                  }`}
                                >
                                  <span>{isNoteOpen ? 'Ocultar orientações detalhadas' : '💡 Ver detalhes de porções e opções'}</span>
                                  {isNoteOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                </button>

                                <AnimatePresence>
                                  {isNoteOpen && (
                                    <motion.p
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className={`mt-1 text-[10px] leading-relaxed italic p-2 rounded-lg ${
                                        isLightUser ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800/50 text-zinc-300'
                                      }`}
                                    >
                                      {meal.obs}
                                    </motion.p>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Embedded Substitution Card if available */}
                        {relatedSub && (
                          <div className="pt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVibrate(10);
                                setExpandedSubs(prev => ({ ...prev, [meal.id]: !prev[meal.id] }));
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${
                                isSubOpen
                                  ? (isLightUser ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-zinc-800 border-zinc-700 text-emerald-400')
                                  : (isLightUser ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100' : 'bg-zinc-800/40 border-zinc-800 text-zinc-400 hover:text-zinc-200')
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <Sparkles size={11} className="text-amber-400 shrink-0" />
                                {relatedSub.name}
                              </span>
                              {isSubOpen ? <ChevronUp size={12} /> : <ChevronRight size={12} />}
                            </button>

                            <AnimatePresence>
                              {isSubOpen && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className={`mt-1.5 p-2.5 rounded-lg border space-y-1.5 text-[10.5px] ${
                                    isLightUser ? 'bg-blue-50/60 border-blue-100 text-zinc-800' : 'bg-zinc-800/60 border-zinc-700 text-zinc-200'
                                  }`}
                                >
                                  {relatedSub.items.map((subItem, sIdx) => (
                                    <div key={sIdx} className="flex justify-between items-center gap-2">
                                      <span className="font-medium">• {subItem.food}</span>
                                      {subItem.quantity && (
                                        <span className="font-mono text-[9.5px] font-bold opacity-80">{subItem.quantity}</span>
                                      )}
                                    </div>
                                  ))}
                                  {relatedSub.obs && (
                                    <p className="text-[9.5px] italic pt-1 border-t border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500">
                                      * {relatedSub.obs}
                                    </p>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Global Substitutions overview */}
        {dietPlan.substitutions && dietPlan.substitutions.length > 0 && (
          <div className={`mt-4 rounded-xl p-3 border ${
            isLightUser ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-900/60 border-zinc-800'
          }`}>
            <h4 className={`text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5 ${
              isLightUser ? 'text-zinc-800' : 'text-zinc-300'
            }`}>
              <Sparkles size={12} className="text-amber-400" />
              Opções de Substituição Gerais
            </h4>

            <div className="space-y-2">
              {dietPlan.substitutions.map((sub, idx) => (
                <div key={idx} className={`p-2.5 rounded-lg border text-[10.5px] space-y-1 ${
                  isLightUser ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-800/40 border-zinc-800/80'
                }`}>
                  <span className={`font-bold uppercase text-[10px] block ${isLightUser ? 'text-[#2563EB]' : 'text-emerald-400'}`}>
                    {sub.name}
                  </span>
                  {sub.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center gap-2">
                      <span className={isLightUser ? 'text-zinc-700' : 'text-zinc-300'}>- {item.food}</span>
                      {item.quantity && <span className="text-[9.5px] font-mono font-bold opacity-75">{item.quantity}</span>}
                    </div>
                  ))}
                  {sub.obs && <p className="text-[9px] italic opacity-75 mt-1">* {sub.obs}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
