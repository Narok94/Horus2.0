import type { WorkoutRoutine } from '../types';
import { exerciseCatalog } from './exerciseCatalog';
import { getExerciseGifUrl } from '../src/utils/exerciseUtils';

export const ABC_NAME = 'ABC — Hipertrofia e Recomposição';
export const ABC_GUIDANCE = 'Intermediário • 5 dias/semana • 07h30 • 40–45 minutos. Aquecer antes do treino. Manter 1–3 repetições em reserva e execução correta; progredir cargas gradualmente. Reavaliar após 4–6 semanas.';
const rows: [string, string, number, string, number, string?][][] = [
  [
    ['supino-inclinado-halteres', 'Supino inclinado com halteres', 3, '8-10', 120],
    ['supino-maquina', 'Supino reto na máquina', 2, '8-12', 90],
    ['elevacao-lateral-polia', 'Elevação lateral na polia', 3, '12-15', 60],
    ['desenvolvimento-halteres', 'Desenvolvimento com halteres', 2, '8-12', 90, 'Histórico de lesão e luxações no ombro direito. Exercício condicionado à liberação profissional e à ausência de dor.'],
    ['triceps-pulley-corda', 'Tríceps na polia com corda', 3, '10-12', 60],
    ['triceps-unilateral-polia', 'Tríceps unilateral na polia', 2, '12-15', 60]
  ],
  [
    ['puxada-triangulo', 'Puxada alta com pegada neutra', 3, '8-10', 120],
    ['remada-articulada', 'Remada articulada com apoio para o peito', 3, '8-12', 90],
    ['puxada-unilateral-polia', 'Puxada unilateral na polia', 2, '10-12', 75, '10–12 repetições por braço.'],
    ['crucifixo-inverso-maquina', 'Crucifixo inverso na máquina', 2, '12-15', 60],
    ['rosca-polia-barra-w', 'Rosca direta na polia baixa com barra W', 3, '8-12', 60],
    ['rosca-martelo-corda', 'Rosca martelo na polia baixa com corda', 2, '10-12', 60]
  ],
  [
    ['leg-press-45', 'Leg press 45°', 3, '8-12', 120],
    ['cadeira-extensora', 'Cadeira extensora', 2, '10-15', 60],
    ['mesa-flexora', 'Mesa flexora', 3, '10-12', 60],
    ['stiff-halteres', 'Levantamento terra romeno com halteres', 2, '8-10', 90],
    ['panturrilha-leg-press', 'Panturrilha no leg press', 3, '12-15', 60],
    ['crunch-polia', 'Abdominal na polia', 2, '12-15', 60]
  ]
];
export const henriqueABC: WorkoutRoutine[] = rows.map((exercises, i) => ({
  id: `henrique-abc-v1-${'abc'[i]}`,
  title: `Treino ${'ABC'[i]} — ${['Peito, ombros e tríceps', 'Costas, bíceps e posterior de ombro', 'Pernas completas e abdômen'][i]}`,
  description: `${ABC_NAME} • ${ABC_GUIDANCE}`, color: ['red', 'emerald', 'violet'][i],
  exercises: exercises.map(([catalogExerciseId, name, sets, reps, rest, notes], index) => {
    const movement = exerciseCatalog.find(ex => ex.id === catalogExerciseId);
    if (!movement) throw new Error(`Movimento ausente: ${catalogExerciseId}`);
    return { id: `henrique-abc-v1-${'abc'[i]}-${index + 1}`, catalogExerciseId, name, sets, reps, rest, notes,
      muscleGroup: movement.muscleGroup, image: getExerciseGifUrl(movement.gifKey) };
  })
}));
/** Reutiliza o ABC cadastrado, arquiva as fichas anteriores e elimina IDs ativos repetidos. */
export function withHenriqueABC(workouts: WorkoutRoutine[]): WorkoutRoutine[] {
  const activeIds = new Set(henriqueABC.map(workout => workout.id));
  const active = henriqueABC.map(template => {
    const saved = workouts.find(workout => workout.id === template.id);
    return { ...(saved || template), archived: false };
  });
  return [...active, ...workouts.filter(workout => !activeIds.has(workout.id)).map(workout =>
    workout.archived ? workout : { ...workout, archived: true })];
}
export const activeWorkouts = (workouts: WorkoutRoutine[]) => workouts.filter(workout => !workout.archived);
/** Semana 1 começa em 26/10/2026. Aritmética UTC evita desvios de horário de verão. */
export function abcOnDay(day: string): WorkoutRoutine | null {
  const date = new Date(day + 'T12:00:00Z');
  const weekday = date.getUTCDay();
  if (!Number.isFinite(date.getTime()) || weekday === 0 || weekday === 6) return null;
  const days = Math.floor((date.getTime() - Date.UTC(2026, 9, 26, 12)) / 86400000);
  const position = Math.floor(days / 7) * 5 + weekday - 1;
  return henriqueABC[((position % 3) + 3) % 3];
}
