import React from 'react';
import { ChevronLeft, ArrowUpRight, Dumbbell } from 'lucide-react';
import { useStore } from '../../store';
import { AppTab, WorkoutRoutine } from '../../types';
import { activeWorkouts } from '../../data/henriqueABC';
import { getDivisionThumbnail, getThumbnailPlan } from '../../src/utils/workoutThumbnails';
export const WorkoutsListView: React.FC = () => {
  const {user,allWorkouts,setSelectedWorkout,setActiveTab,isWorkoutActive,selectedWorkout,addToast}=useStore();
  if(!user) return null;
  const workouts=activeWorkouts(allWorkouts[user.username.toLowerCase()] || []);
  const open=(workout:WorkoutRoutine)=>{
    if(isWorkoutActive && selectedWorkout && selectedWorkout.id!==workout.id){addToast?.('Uma sessão já está em andamento. Finalize ou descarte para iniciar outra.','info');setActiveTab(AppTab.WORKOUT);return;}
    setSelectedWorkout(workout);setActiveTab(AppTab.WORKOUT);
  };
  return <section className="redesign-workouts"><header className="redesign-page-header"><button aria-label="Voltar ao início" onClick={()=>setActiveTab(AppTab.DASHBOARD)}><ChevronLeft size={22}/></button><h1>Meus Treinos</h1></header><div className="redesign-covers">{workouts.map(workout=>{
    const image=getDivisionThumbnail(workout,getThumbnailPlan(user.username,workout));
    return <button key={workout.id} className="redesign-cover-card" aria-label={`Abrir ${workout.title}`} onClick={()=>open(workout)}>{image ? <div className="refined-cover-media"><img src={image} alt={workout.title}/></div> : <span><Dumbbell/>{workout.title}</span>}<span className="refined-cover-action">Ver treino<ArrowUpRight size={19}/></span></button>;
  })}</div></section>;
};
