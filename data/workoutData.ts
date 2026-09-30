import { WorkoutRoutine } from '../types';
import { getExerciseGifUrl } from '../src/utils/exerciseUtils';

export const jessicaWorkouts: WorkoutRoutine[] = [
  {
    id: 't2-a',
    title: 'Treino A — Peito e Tríceps',
    description: 'Cardio todos os dias pós treino 25\' • Alongamento',
    color: 'purple',
    exercises: [
      { id: 't2a-1', name: 'Supino Reto', muscleGroup: 'Peito', sets: 3, reps: '8-10', rest: 45, image: getExerciseGifUrl('Supino Reto (máquina)') },
      { id: 't2a-2', name: 'Supino Inclinado', muscleGroup: 'Peito', sets: 4, reps: '10-12', rest: 45, image: getExerciseGifUrl('Supino inclinado (máquina)') },
      { id: 't2a-3', name: 'Peck Deck', muscleGroup: 'Peito', sets: 4, reps: '10', rest: 45, image: getExerciseGifUrl('Peck Deck') },
      { id: 't2a-4', name: 'Tríceps Pulley', muscleGroup: 'Tríceps', sets: 3, reps: '10', rest: 45, image: getExerciseGifUrl('Tríceps Pulley') },
      { id: 't2a-5', name: 'Tríceps Corda', muscleGroup: 'Tríceps', sets: 4, reps: '10-12', rest: 45, image: getExerciseGifUrl('Tríceps Corda') },
      { id: 't2a-6', name: 'Tríceps Francês', muscleGroup: 'Tríceps', sets: 3, reps: '9-10', rest: 45, image: getExerciseGifUrl('Tríceps Francês') }
    ]
  },
  {
    id: 't2-b',
    title: 'Treino B — Quadríceps',
    description: 'Alongamento e Bicicleta 5\' antes do treino • Cardio pós 25\'',
    color: 'emerald',
    exercises: [
      { id: 't2b-1', name: 'Agachamento Barra Guiada', muscleGroup: 'Quadríceps', sets: 4, reps: '10', rest: 45, image: getExerciseGifUrl('Agachamento Smith') },
      { id: 't2b-2', name: 'Leg 45º + Afundo', muscleGroup: 'Quadríceps', sets: 4, reps: '12 / 10', rest: 45, image: getExerciseGifUrl('Leg Press 45') },
      { id: 't2b-3', name: 'Hack', muscleGroup: 'Quadríceps', sets: 3, reps: '10', rest: 45, image: getExerciseGifUrl('Agachamento Hack') },
      { id: 't2b-4', name: 'Cadeira Extensora', muscleGroup: 'Quadríceps', sets: 4, reps: '15', rest: 45, image: getExerciseGifUrl('Cadeira Extensora') },
      { id: 't2b-5', name: 'Cadeira Adutora', muscleGroup: 'Pernas', sets: 4, reps: 'Até a falha', rest: 45, image: getExerciseGifUrl('Cadeira Adutora') },
      { id: 't2b-6', name: 'Panturrilha em Pé', muscleGroup: 'Panturrilha', sets: 4, reps: 'Até a falha', rest: 45, image: getExerciseGifUrl('Panturrilha em Pé') }
    ]
  },
  {
    id: 't2-c',
    title: 'Treino C — Costa e Bíceps',
    description: 'Alongamento • Cardio pós 25\'',
    color: 'orange',
    exercises: [
      { id: 't2c-1', name: 'Pulley Aberto', muscleGroup: 'Costas', sets: 4, reps: '8-10', rest: 45, image: getExerciseGifUrl('Puxada frente') },
      { id: 't2c-2', name: 'Pulley Triângulo', muscleGroup: 'Costas', sets: 4, reps: '10-12', rest: 45, image: getExerciseGifUrl('Puxada Triângulo') },
      { id: 't2c-3', name: 'Remada Sentada', muscleGroup: 'Costas', sets: 3, reps: '12', rest: 45, image: getExerciseGifUrl('Remada baixa') },
      { id: 't2c-4', name: 'Rosca Direta Barra W', muscleGroup: 'Bíceps', sets: 4, reps: '10', rest: 45, image: getExerciseGifUrl('Rosca Barra W') },
      { id: 't2c-5', name: 'Rosca Scott Barra W', muscleGroup: 'Bíceps', sets: 3, reps: '10', rest: 45, image: getExerciseGifUrl('Rosca Scott') },
      { id: 't2c-6', name: 'Rosca Martelo Corda', muscleGroup: 'Bíceps', sets: 4, reps: '12-15', rest: 45, image: getExerciseGifUrl('Rosca Martelo') }
    ]
  },
  {
    id: 't2-d',
    title: 'Treino D — Posterior e Glúteo',
    description: 'Alongamento e Bicicleta 5\' antes treino • Cardio pós 25\'',
    color: 'rose',
    exercises: [
      { id: 't2d-1', name: 'Mesa Flexora', muscleGroup: 'Posterior', sets: 4, reps: '12', rest: 45, image: getExerciseGifUrl('Mesa Flexora') },
      { id: 't2d-2', name: 'Stiff com Halteres', muscleGroup: 'Posterior', sets: 3, reps: '12', rest: 45, image: getExerciseGifUrl('Stiff') },
      { id: 't2d-3', name: 'Cadeira Flexora', muscleGroup: 'Posterior', sets: 4, reps: '12', rest: 45, image: getExerciseGifUrl('Cadeira Flexora') },
      { id: 't2d-4', name: 'Búlgaro', muscleGroup: 'Posterior', sets: 3, reps: '10', rest: 45, notes: 'SOLO', image: getExerciseGifUrl('Agachamento Búlgaro') },
      { id: 't2d-5', name: 'Cadeira Abdutora', muscleGroup: 'Glúteo', sets: 4, reps: '15', rest: 45, notes: 'ELEVAÇÃO', image: getExerciseGifUrl('Cadeira Abdutora') },
      { id: 't2d-6', name: 'Levantamento Pélvico', muscleGroup: 'Glúteo', sets: 5, reps: '10', rest: 45, notes: '3\' no pico de contração', image: getExerciseGifUrl('Elevação pélvica') },
      { id: 't2d-7', name: 'Panturrilha Sentada', muscleGroup: 'Panturrilha', sets: 4, reps: 'Até a Falha', rest: 45, image: getExerciseGifUrl('Panturrilha Sentada') }
    ]
  },
  {
    id: 't2-e',
    title: 'Treino E — Ombro',
    description: 'Alongamento • Cardio pós 25\'',
    color: 'blue',
    exercises: [
      { id: 't2e-1', name: 'Desenvolvimento Aberto Barra', muscleGroup: 'Ombros', sets: 4, reps: '10', rest: 45, image: getExerciseGifUrl('Desenvolvimento') },
      { id: 't2e-2', name: 'Frontal com Halteres', muscleGroup: 'Ombros', sets: 3, reps: '8-9', rest: 45, image: getExerciseGifUrl('Elevação Frontal') },
      { id: 't2e-3', name: 'Elevação Lateral', muscleGroup: 'Ombros', sets: 4, reps: '10-12', rest: 45, image: getExerciseGifUrl('Elevação lateral') },
      { id: 't2e-4', name: 'Crucifixo Inverso', muscleGroup: 'Ombros', sets: 4, reps: '10-12', rest: 45, image: getExerciseGifUrl('Crucifixo Inverso') },
      { id: 't2e-5', name: 'Encolhimento Ombro', muscleGroup: 'Trapézio', sets: 3, reps: 'Até a Falha', rest: 45, image: getExerciseGifUrl('Encolhimento') }
    ]
  }
];

export const henriqueWorkouts: WorkoutRoutine[] = [
  {
    id: 'h-a',
    title: 'Peito e Bíceps',
    description: 'Objetivo: Hipertrofia, Saúde',
    color: 'purple',
    exercises: [
      { id: 'ha-1', name: 'Supino reto com barra', muscleGroup: 'Peito', sets: 3, reps: '6-10', rest: 45, image: getExerciseGifUrl('Supino Reto') },
      { id: 'ha-2', name: 'Supino inclinado com halteres', muscleGroup: 'Peito', sets: 3, reps: '8-12', rest: 45, image: getExerciseGifUrl('Supino Inclinado') },
      { id: 'ha-3', name: 'Supino inclinado na máquina', muscleGroup: 'Peito', sets: 2, reps: '10-12', rest: 45, image: getExerciseGifUrl('Supino inclinado (máquina)') },
      { id: 'ha-4', name: 'Crucifixo na máquina', muscleGroup: 'Peito', sets: 2, reps: '12-15', rest: 45, image: getExerciseGifUrl('Peck Deck') },
      { id: 'ha-5', name: 'Rosca direta com barra', muscleGroup: 'Bíceps', sets: 3, reps: '8-12', rest: 45, image: getExerciseGifUrl('Rosca Direta') },
      { id: 'ha-6', name: 'Rosca alternada com halteres', muscleGroup: 'Bíceps', sets: 3, reps: '10-12', rest: 45, notes: 'cada braço', image: getExerciseGifUrl('Rosca Alternada') },
      { id: 'ha-7', name: 'Rosca martelo', muscleGroup: 'Bíceps', sets: 2, reps: '10-15', rest: 45, image: getExerciseGifUrl('Rosca martelo') }
    ]
  },
  {
    id: 'h-b',
    title: 'Quadríceps, Panturrilha e Abdômen',
    description: 'Objetivo: Hipertrofia, Saúde',
    color: 'emerald',
    exercises: [
      { id: 'hb-1', name: 'Agachamento livre', muscleGroup: 'Quadríceps', sets: 3, reps: '6-10', rest: 45, image: getExerciseGifUrl('Agachamento') },
      { id: 'hb-2', name: 'Leg Press 45°', muscleGroup: 'Quadríceps', sets: 3, reps: '10-15', rest: 45, image: getExerciseGifUrl('Leg Press 45') },
      { id: 'hb-3', name: 'Afundo', muscleGroup: 'Quadríceps', sets: 3, reps: '8-12', rest: 45, notes: 'cada perna', image: getExerciseGifUrl('Afundo') },
      { id: 'hb-4', name: 'Cadeira extensora', muscleGroup: 'Quadríceps', sets: 3, reps: '12-15', rest: 45, image: getExerciseGifUrl('Cadeira Extensora') },
      { id: 'hb-5', name: 'Panturrilha em pé', muscleGroup: 'Panturrilha', sets: 4, reps: '10-15', rest: 45, image: getExerciseGifUrl('Panturrilha em Pé') },
      { id: 'hb-6', name: 'Panturrilha sentada', muscleGroup: 'Panturrilha', sets: 3, reps: '12-20', rest: 45, image: getExerciseGifUrl('Panturrilha Sentada') },
      { id: 'hb-7', name: 'Elevação de pernas / abdominal infra', muscleGroup: 'Abdômen', sets: 3, reps: '10-15', rest: 45, image: getExerciseGifUrl('Abdominal') }
    ]
  },
  {
    id: 'h-c',
    title: 'Costas e Tríceps',
    description: 'Objetivo: Hipertrofia, Saúde',
    color: 'orange',
    exercises: [
      { id: 'hc-1', name: 'Puxada alta na frente', muscleGroup: 'Costas', sets: 4, reps: '8-12', rest: 45, image: getExerciseGifUrl('Puxada frente') },
      { id: 'hc-2', name: 'Puxada unilateral na polia', muscleGroup: 'Costas', sets: 3, reps: '10-15', rest: 45, image: getExerciseGifUrl('Puxada frente') },
      { id: 'hc-3', name: 'Remada curvada', muscleGroup: 'Costas', sets: 3, reps: '6-10', rest: 45, image: getExerciseGifUrl('Remada Curvada') },
      { id: 'hc-4', name: 'Remada cavalinho', muscleGroup: 'Costas', sets: 2, reps: '8-12', rest: 45, image: getExerciseGifUrl('Remada Cavalinho') },
      { id: 'hc-5', name: 'Tríceps testa com barra W', muscleGroup: 'Tríceps', sets: 3, reps: '8-12', rest: 45, image: getExerciseGifUrl('Tríceps testa') },
      { id: 'hc-6', name: 'Tríceps francês', muscleGroup: 'Tríceps', sets: 3, reps: '10-15', rest: 45, image: getExerciseGifUrl('Tríceps Francês') },
      { id: 'hc-7', name: 'Tríceps pulley com corda', muscleGroup: 'Tríceps', sets: 2, reps: '12-15', rest: 45, image: getExerciseGifUrl('Tríceps Corda') }
    ]
  },
  {
    id: 'h-d',
    title: 'Ombros, Trapézio e Abdômen',
    description: 'Objetivo: Hipertrofia, Saúde',
    color: 'rose',
    exercises: [
      { id: 'hd-1', name: 'Desenvolvimento com halteres', muscleGroup: 'Ombros', sets: 3, reps: '6-10', rest: 45, image: getExerciseGifUrl('Desenvolvimento') },
      { id: 'hd-2', name: 'Elevação lateral', muscleGroup: 'Ombros', sets: 4, reps: '10-15', rest: 45, image: getExerciseGifUrl('Elevação lateral') },
      { id: 'hd-3', name: 'Crucifixo inverso / Peck Deck inverso', muscleGroup: 'Ombros', sets: 3, reps: '12-15', rest: 45, image: getExerciseGifUrl('Peck Deck') },
      { id: 'hd-4', name: 'Elevação lateral na polia', muscleGroup: 'Ombros', sets: 2, reps: '12-20', rest: 45, image: getExerciseGifUrl('Elevação lateral') },
      { id: 'hd-5', name: 'Encolhimento com halteres', muscleGroup: 'Trapézio', sets: 3, reps: '10-15', rest: 45, image: getExerciseGifUrl('Encolhimento (halteres)') },
      { id: 'hd-6', name: 'Abdominal na máquina', muscleGroup: 'Abdômen', sets: 3, reps: '10-15', rest: 45, image: getExerciseGifUrl('Abdominal') },
      { id: 'hd-7', name: 'Prancha', muscleGroup: 'Abdômen', sets: 2, reps: '45-60s', rest: 45, image: getExerciseGifUrl('Prancha') }
    ]
  },
  {
    id: 'h-e',
    title: 'Posterior, Glúteo, Panturrilha, Abdômen e Cardio',
    description: 'Objetivo: Hipertrofia, Saúde',
    color: 'blue',
    exercises: [
      { id: 'he-1', name: 'Stiff', muscleGroup: 'Posterior', sets: 3, reps: '6-10', rest: 45, image: getExerciseGifUrl('Stiff') },
      { id: 'he-2', name: 'Mesa flexora', muscleGroup: 'Posterior', sets: 3, reps: '10-15', rest: 45, image: getExerciseGifUrl('Mesa Flexora') },
      { id: 'he-3', name: 'Cadeira flexora', muscleGroup: 'Posterior', sets: 2, reps: '10-15', rest: 45, image: getExerciseGifUrl('Cadeira Flexora') },
      { id: 'he-4', name: 'Hip Thrust / Elevação pélvica', muscleGroup: 'Glúteo', sets: 3, reps: '8-12', rest: 45, image: getExerciseGifUrl('Hip Thrust - elevação pélvica') },
      { id: 'he-5', name: 'Cadeira abdutora', muscleGroup: 'Glúteo', sets: 2, reps: '15-20', rest: 45, image: getExerciseGifUrl('Cadeira Abdutora') },
      { id: 'he-6', name: 'Panturrilha em pé', muscleGroup: 'Panturrilha', sets: 3, reps: '12-20', rest: 45, image: getExerciseGifUrl('Panturrilha em Pé') },
      { id: 'he-7', name: 'Crunch na polia', muscleGroup: 'Abdômen', sets: 3, reps: '10-15', rest: 45, image: getExerciseGifUrl('Abdominal') },
      { id: 'he-8', name: 'Cardio: esteira ou bike', muscleGroup: 'Cardio', sets: 1, reps: '20-30 min', rest: 0, image: getExerciseGifUrl('Cardio') }
    ]
  },
  {
    id: 'h-pump',
    title: 'Treino de Pump',
    description: 'Objetivo: Hipertrofia, Pump e Vascularização',
    color: 'pink',
    exercises: [
      { id: 'hp-1', name: 'Supino inclinado com halteres', muscleGroup: 'Peito', sets: 4, reps: '12-15', rest: 45, image: getExerciseGifUrl('Supino Inclinado') },
      { id: 'hp-2', name: 'Crucifixo na máquina', muscleGroup: 'Peito', sets: 3, reps: '15-20', rest: 30, image: getExerciseGifUrl('Peck Deck') },
      { id: 'hp-3', name: 'Puxada alta na frente', muscleGroup: 'Costas', sets: 4, reps: '12-15', rest: 45, image: getExerciseGifUrl('Puxada frente') },
      { id: 'hp-4', name: 'Remada cavalinho', muscleGroup: 'Costas', sets: 3, reps: '15-20', rest: 30, image: getExerciseGifUrl('Remada Cavalinho') },
      { id: 'hp-5', name: 'Elevação lateral', muscleGroup: 'Ombros', sets: 4, reps: '15-20', rest: 30, image: getExerciseGifUrl('Elevação lateral') },
      { id: 'hp-6', name: 'Rosca direta com barra', muscleGroup: 'Bíceps', sets: 3, reps: '12-15', rest: 30, image: getExerciseGifUrl('Rosca Direta') },
      { id: 'hp-7', name: 'Rosca martelo', muscleGroup: 'Bíceps', sets: 2, reps: '15-20', rest: 20, image: getExerciseGifUrl('Rosca martelo') },
      { id: 'hp-8', name: 'Tríceps pulley com corda', muscleGroup: 'Tríceps', sets: 3, reps: '15-20', rest: 30, image: getExerciseGifUrl('Tríceps Corda') },
      { id: 'hp-9', name: 'Tríceps francês', muscleGroup: 'Tríceps', sets: 2, reps: '15-20', rest: 20, image: getExerciseGifUrl('Tríceps Francês') }
    ]
  }
];
