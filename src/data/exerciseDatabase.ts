import { getExerciseGifUrl } from '../utils/exerciseUtils';

export interface BaseExercise {
  name: string;
  muscleGroup: string;
  defaultSets: number;
  defaultReps: string;
  defaultRest: number;
  image?: string;
}

export const exerciseDatabase: BaseExercise[] = [
  // PEITO
  { name: 'Supino Reto Barra', muscleGroup: 'Peito', defaultSets: 3, defaultReps: '10-12', defaultRest: 90, image: getExerciseGifUrl('Supino Reto Barra') },
  { name: 'Supino Inclinado Halter', muscleGroup: 'Peito', defaultSets: 3, defaultReps: '10-12', defaultRest: 90, image: getExerciseGifUrl('Supino Inclinado Halteres') },
  { name: 'Peck Deck (Voador)', muscleGroup: 'Peito', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Peck Deck') },
  { name: 'Flexão de Braços', muscleGroup: 'Peito', defaultSets: 3, defaultReps: 'Máx', defaultRest: 60, image: getExerciseGifUrl('Flexão de Braços') },
  { name: 'Crossover Polia Alta', muscleGroup: 'Peito', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Crossover Polia Alta') },
  { name: 'Supino Inclinado Barra', muscleGroup: 'Peito', defaultSets: 3, defaultReps: '10-12', defaultRest: 90, image: getExerciseGifUrl('Supino Inclinado Barra') },
  { name: 'Supino Reto Halteres', muscleGroup: 'Peito', defaultSets: 3, defaultReps: '10-12', defaultRest: 90, image: getExerciseGifUrl('Supino Reto Halteres') },
  { name: 'Supino Máquina', muscleGroup: 'Peito', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Supino Máquina') },
  { name: 'Crucifixo Máquina', muscleGroup: 'Peito', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Crucifixo Máquina') },
  { name: 'Crucifixo Banco Halteres', muscleGroup: 'Peito', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Crucifixo Banco Halteres') },
  { name: 'Dips (Paralelas)', muscleGroup: 'Peito/Tríceps', defaultSets: 3, defaultReps: 'Máx', defaultRest: 90, image: getExerciseGifUrl('Dips') },

  // COSTAS
  { name: 'Puxada Alta Pronada', muscleGroup: 'Costas', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Puxada Frente Aberta') },
  { name: 'Remada Baixa Triângulo', muscleGroup: 'Costas', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, image: getExerciseGifUrl('Remada Baixa') },
  { name: 'Remada Curvada Barra', muscleGroup: 'Costas', defaultSets: 3, defaultReps: '8-12', defaultRest: 90, image: getExerciseGifUrl('Remada Curvada Barra') },
  { name: 'Pulldown Polia', muscleGroup: 'Costas', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Pulldown Corda') },
  { name: 'Levantamento Terra', muscleGroup: 'Costas', defaultSets: 3, defaultReps: '6-8', defaultRest: 120, image: getExerciseGifUrl('Levantamento Terra') },
  { name: 'Puxada Frente Aberta', muscleGroup: 'Costas', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Puxada Frente Aberta') },
  { name: 'Puxada Triângulo', muscleGroup: 'Costas', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, image: getExerciseGifUrl('Puxada Triângulo') },
  { name: 'Puxada Supinada', muscleGroup: 'Costas', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Puxada Supinada') },
  { name: 'Remada Unilateral (Serrote)', muscleGroup: 'Costas', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, image: getExerciseGifUrl('Remada Unilateral') },
  { name: 'Remada Articulada', muscleGroup: 'Costas', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Remada Articulada') },
  { name: 'Barra Fixa', muscleGroup: 'Costas', defaultSets: 3, defaultReps: 'Máx', defaultRest: 90, image: getExerciseGifUrl('Barra Fixa') },

  // PERNAS
  { name: 'Agachamento Livre', muscleGroup: 'Pernas', defaultSets: 3, defaultReps: '10-12', defaultRest: 90, image: getExerciseGifUrl('Agachamento Livre') },
  { name: 'Leg Press 45', muscleGroup: 'Pernas', defaultSets: 3, defaultReps: '12-15', defaultRest: 90, image: getExerciseGifUrl('Leg Press 45') },
  { name: 'Cadeira Extensora', muscleGroup: 'Pernas', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Cadeira Extensora') },
  { name: 'Mesa Flexora', muscleGroup: 'Pernas', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Mesa Flexora') },
  { name: 'Elevação Pélvica', muscleGroup: 'Pernas', defaultSets: 3, defaultReps: '12-15', defaultRest: 90, image: getExerciseGifUrl('Elevação Pélvica') },
  { name: 'Gêmeos Sentado', muscleGroup: 'Pernas', defaultSets: 4, defaultReps: '15-20', defaultRest: 45, image: getExerciseGifUrl('Panturrilha Sentado') },
  { name: 'Cadeira Flexora', muscleGroup: 'Pernas', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Cadeira Flexora') },
  { name: 'Stiff Barra', muscleGroup: 'Pernas', defaultSets: 3, defaultReps: '10-12', defaultRest: 90, image: getExerciseGifUrl('Stiff Barra') },
  { name: 'Hack Machine', muscleGroup: 'Pernas', defaultSets: 3, defaultReps: '10-12', defaultRest: 90, image: getExerciseGifUrl('Hack Machine') },
  { name: 'Agachamento Sumô', muscleGroup: 'Pernas', defaultSets: 3, defaultReps: '12-15', defaultRest: 90, image: getExerciseGifUrl('Agachamento Sumô') },
  { name: 'Agachamento Búlgaro', muscleGroup: 'Pernas', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, image: getExerciseGifUrl('Agachamento Búlgaro') },

  // OMBROS
  { name: 'Elevação Lateral Halter', muscleGroup: 'Ombros', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Elevação Lateral') },
  { name: 'Desenvolvimento Halter', muscleGroup: 'Ombros', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, image: getExerciseGifUrl('Desenvolvimento Halteres') },
  { name: 'Crucifixo Invertido', muscleGroup: 'Ombros', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Crucifixo Inverso') },
  { name: 'Elevação Frontal Polia', muscleGroup: 'Ombros', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Elevação Frontal') },
  { name: 'Desenvolvimento Máquina', muscleGroup: 'Ombros', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Desenvolvimento Máquina') },
  { name: 'Remada Alta', muscleGroup: 'Ombros/Trapézio', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Remada Alta') },
  { name: 'Encolhimento', muscleGroup: 'Trapézio', defaultSets: 3, defaultReps: '15-20', defaultRest: 60, image: getExerciseGifUrl('Encolhimento') },

  // BRAÇOS
  { name: 'Rosca Direta Barra W', muscleGroup: 'Braços', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, image: getExerciseGifUrl('Rosca Direta Barra') },
  { name: 'Rosca Martelo', muscleGroup: 'Braços', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, image: getExerciseGifUrl('Rosca Martelo') },
  { name: 'Tríceps Pulley', muscleGroup: 'Braços', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Tríceps Barra') },
  { name: 'Tríceps Testa', muscleGroup: 'Braços', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, image: getExerciseGifUrl('Tríceps Testa') },
  { name: 'Tríceps Coice', muscleGroup: 'Braços', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Tríceps Coice') },
  { name: 'Rosca Alternada', muscleGroup: 'Braços', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, image: getExerciseGifUrl('Rosca Alternada') },
  { name: 'Rosca Scott', muscleGroup: 'Braços', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, image: getExerciseGifUrl('Rosca Scott') },
  { name: 'Tríceps Pulley (Corda)', muscleGroup: 'Braços', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Tríceps Corda') },
  { name: 'Tríceps Francês', muscleGroup: 'Braços', defaultSets: 3, defaultReps: '10-12', defaultRest: 60, image: getExerciseGifUrl('Tríceps Francês') },
  { name: 'Mergulho no Banco', muscleGroup: 'Braços', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Tríceps Banco') },

  // GLÚTEOS
  { name: 'Abdução Solo Pilates', muscleGroup: 'Glúteos', defaultSets: 3, defaultReps: '15-20', defaultRest: 60, image: getExerciseGifUrl('Abdução Solo Pilates') },
  { name: 'Gluteo Máquina Coice', muscleGroup: 'Glúteos', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Gluteo Máquina Coice') },
  { name: 'Cadeira Abdutora', muscleGroup: 'Glúteos', defaultSets: 3, defaultReps: '15-20', defaultRest: 60, image: getExerciseGifUrl('Cadeira Abdutora') },
  { name: 'Glúteo Cabo (Coice)', muscleGroup: 'Glúteos', defaultSets: 3, defaultReps: '12-15', defaultRest: 60, image: getExerciseGifUrl('Glúteo Cabo (Coice)') },

  // ABDÔMEN
  { name: 'Abdominal Supra', muscleGroup: 'Abdômen', defaultSets: 3, defaultReps: '20-30', defaultRest: 45, image: getExerciseGifUrl('Abdominal Supra') },
  { name: 'Abdominal Infra', muscleGroup: 'Abdômen', defaultSets: 3, defaultReps: '15-20', defaultRest: 45, image: getExerciseGifUrl('Abdominal Infra') },
  { name: 'Prancha Abdominal', muscleGroup: 'Abdômen', defaultSets: 3, defaultReps: '45-60s', defaultRest: 45, image: getExerciseGifUrl('Prancha') },

  // ALONGAMENTO
  { name: 'Alongamento de Peitoral', muscleGroup: 'Alongamento', defaultSets: 1, defaultReps: '30s', defaultRest: 0, image: getExerciseGifUrl('Alongamento de Peitoral') },
  { name: 'Alongamento de Quadríceps', muscleGroup: 'Alongamento', defaultSets: 1, defaultReps: '30s', defaultRest: 0, image: getExerciseGifUrl('Alongamento de Quadríceps') },
  { name: 'Alongamento de Posterior', muscleGroup: 'Alongamento', defaultSets: 1, defaultReps: '30s', defaultRest: 0, image: getExerciseGifUrl('Alongamento de Posterior') },
];
