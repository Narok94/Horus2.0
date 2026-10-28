/// <reference types="vite/client" />
// Mapeamento explícito dos PNGs aprovados para o ABC de Henrique.
import exercise0 from '../assets/miniaturas-horus/01_supino_inclinado_halteres.png';
import exercise1 from '../assets/miniaturas-horus/02_supino_reto_maquina.png';
import exercise2 from '../assets/miniaturas-horus/03_elevacao_lateral_polia.png';
import exercise3 from '../assets/miniaturas-horus/04_desenvolvimento_halteres.png';
import exercise4 from '../assets/miniaturas-horus/05_triceps_corda.png';
import exercise5 from '../assets/miniaturas-horus/06_triceps_unilateral_polia.png';
import exercise6 from '../assets/miniaturas-horus/07_puxada_alta_neutra.png';
import exercise7 from '../assets/miniaturas-horus/08_remada_articulada_apoio_peito.png';
import exercise8 from '../assets/miniaturas-horus/09_puxada_unilateral_polia.png';
import exercise9 from '../assets/miniaturas-horus/10_crucifixo_inverso_maquina.png';
import exercise10 from '../assets/miniaturas-horus/11_rosca_direta_polia_barra_w.png';
import exercise11 from '../assets/miniaturas-horus/12_rosca_martelo_polia_corda.png';
import exercise12 from '../assets/miniaturas-horus/13_leg_press_45.png';
import exercise13 from '../assets/miniaturas-horus/14_cadeira_extensora.png';
import exercise14 from '../assets/miniaturas-horus/15_mesa_flexora.png';
import exercise15 from '../assets/miniaturas-horus/16_terra_romeno_halteres.png';
import exercise16 from '../assets/miniaturas-horus/17_panturrilha_leg_press.png';
import exercise17 from '../assets/miniaturas-horus/18_abdominal_polia.png';
import cover0 from '../assets/miniaturas-horus/treino_a_peito_ombros_triceps.png';
import cover1 from '../assets/miniaturas-horus/treino_b_costas_biceps_posterior_ombro.png';
import cover2 from '../assets/miniaturas-horus/treino_c_pernas_abdomen.png';
export const abcExerciseImages: Record<string, string> = {
  'supino-inclinado-halteres': exercise0,
  'supino-maquina': exercise1,
  'elevacao-lateral-polia': exercise2,
  'desenvolvimento-halteres': exercise3,
  'triceps-pulley-corda': exercise4,
  'triceps-unilateral-polia': exercise5,
  'puxada-triangulo': exercise6,
  'remada-articulada': exercise7,
  'puxada-unilateral-polia': exercise8,
  'crucifixo-inverso-maquina': exercise9,
  'rosca-polia-barra-w': exercise10,
  'rosca-martelo-corda': exercise11,
  'leg-press-45': exercise12,
  'cadeira-extensora': exercise13,
  'mesa-flexora': exercise14,
  'stiff-halteres': exercise15,
  'panturrilha-leg-press': exercise16,
  'crunch-polia': exercise17,
};
export const abcDivisionImages: Record<string, string> = { a: cover0, b: cover1, c: cover2 };
