
/**
 * Utilitários para manipulação de dados de exercícios
 */

/**
 * Normaliza o nome do exercício para ser usado em URLs e IDs
 */
export const normalizeExerciseName = (name: string): string => {
  if (!name) return '';
  
  // Mapeamento manual para casos específicos conhecidos
  const manualMap: Record<string, string> = {
    'Agachamento Livre': 'agachamento-livre',
    'Agachamento no Smith': 'agachamento-smith',
    'Leg Press 45': 'leg-press-45',
    'Extensora': 'cadeira-extensora',
    'Flexora': 'cadeira-flexora',
    'Supino Reto': 'supino-reto',
    'Supino Inclinado': 'supino-inclinado',
    'Puxada Aberta': 'puxada-frente',
    'Puxada Frente Aberta': 'puxada-frente',
    'Remada Curvada': 'remada-curvada',
    'Desenvolvimento': 'desenvolvimento-ombros',
    'Elevação Lateral': 'elevacao-lateral',
    'Rosca Direta': 'rosca-direta',
    'Tríceps Corda': 'triceps-corda',
    'Tríceps Pulley (Corda)': 'triceps-corda',
    'Tríceps Pulley (Barra)': 'triceps-barra',
    'Tríceps Testa': 'triceps-testa',
    'Panturrilha em Pé': 'panturrilha-pe',
    'Panturrilha Sentado': 'panturrilha-sentado',
    'Abdominal Supra': 'abdominal-supra',
    'Prancha': 'prancha-abdominal',
    'Remada Unilateral (Serrote)': 'remada-unilateral',
    'Remada Unilateral': 'remada-unilateral',
    'Crossover Polia Alta': 'crossover-polia-alta',
    'Dips (Paralelas)': 'dips',
    'Peck Deck (Voador)': 'peck-deck',
    'Peck Deck': 'peck-deck',
    'Agachamento Sumô': 'agachamento-sumo-com-halteres',
    'Agachamento Hack': 'agachamento-hack-machine',
    'Hack Machine': 'agachamento-hack-machine',
    'Sissy Squat': 'agachamento-sissy',
    'Afundo com Halteres': 'afundo-com-halteres',
    'Agachamento Búlgaro': 'agachamento-bulgaro',
    'Supino Reto Barra': 'supino-reto-com-barra',
    'Supino Inclinado Barra': 'supino-inclinado-com-barra',
    'Supino Reto Halteres': 'supino-reto-com-halteres',
    'Supino Inclinado Halteres': 'supino-inclinado-com-halteres',
    'Supino Máquina': 'supino-na-maquina',
    'Crucifixo Máquina': 'crucifixo-na-maquina',
    'Crucifixo Banco Halteres': 'crucifixo-com-halteres',
    'Flexão de Braços': 'flexão-de-braços',
    'Puxada Triângulo': 'puxada-frente-com-triângulo',
    'Puxada Supinada': 'puxada-frente-com-pegada-supinada',
    'Remada Baixa': 'remada-baixa-com-triângulo',
    'Remada Articulada': 'remada-na-maquina',
    'Pulldown Corda': 'pulldown-na-polia-com-corda',
    'Barra Fixa': 'barra-fixa',
    'Levantamento Terra': 'levantamento-terra-com-barra',
    'Desenvolvimento Halteres': 'desenvolvimento-de-ombros-com-halteres',
    'Desenvolvimento Máquina': 'desenvolvimento-de-ombros-na-maquina',
    'Elevação Frontal': 'elevação-frontal-com-halteres',
    'Crucifixo Inverso': 'crucifixo-inverso-com-halteres',
    'Remada Alta': 'remada-alta-na-polia',
    'Encolhimento': 'encolhimento-com-halteres',
    'Rosca Direta Barra': 'rosca-direta-com-barra',
    'Rosca Alternada': 'rosca-alternada-com-halteres',
    'Rosca Martelo': 'rosca-martelo-com-halteres',
    'Rosca Scott': 'rosca-scott-com-barra-w',
    'Rosca Concentrada': 'rosca-concentrada-com-halteres',
    'Rosca Direta Polia': 'rosca-direta-na-polia',
    'Tríceps Francês': 'triceps-frances-com-haltere',
    'Tríceps Coice': 'triceps-coice-com-haltere',
    'Mesa Flexora': 'mesa-flexora',
    'Stiff Barra': 'stiff-com-barra',
    'Flexora em Pé': 'flexora-vertical',
    'Abdução de Quadril com Cabo': 'abdução-de-quadril-com-cabo',
    'Abdução de Quadril com Ponte': 'abdução-de-quadril-com-ponte',
    'Glúteo Máquina': 'gluteo-na-maquina',
    'Abdominal Infra': 'abdominal-infra',
    'Abdominal Bicicleta': 'abdominal-bicicleta',
    'Abdominal Máquina': 'abdominal-maquina',
    'Alongamento de Peitoral': 'alongamento-dinâmico-do-peitoral',
    'Alongamento de Quadríceps': 'alongamento-de-quadríceps-ajoelhado',
    'Alongamento de Posterior': 'alongamento-de-isquiotibiais-em-pé',
    'Alongamento de Glúteos': 'alongamento-de-glúteos-deitado',
    'Alongamento de Ombros': 'alongamento-de-ombro-com-o-braço-cruzado',
    'Abdução Solo Pilates': 'abducao-solo-pilates',
    'Gluteo Máquina Coice': 'gluteo-maquina-coice',
    'Glúteo Cabo (Coice)': 'gluteo-no-cabo-coice',
    'Elevação Pélvica': 'elevação-pélvica-com-barra',
    'Cadeira Abdutora': 'abduçao-de-quadril-em-pé',
    'Cadeira Adutora': 'adução-na-polia',
    'Pulley anterior aberta': 'puxada-frente',
    'Remada articulada neutra': 'remada-na-maquina',
    'Crucifixo inverso máquina pronada': 'crucifixo-inverso-na-maquina',
    'Remada baixa peg. neutra': 'remada-baixa-com-triângulo',
    'Rosca martelo no cross corda': 'rosca-martelo-na-polia',
    'Rosca direta barra reta': 'rosca-direta-com-barra',
    'Supino inclinado iso articulado deitado (shua)': 'supino-inclinado-na-maquina',
    'Elevação lateral c/ halter 0º-180º neutra': 'elevacao-lateral',
    'Elevação frontal no cross': 'elevação-frontal-na-polia',
    'Tríceps no cross barra reta': 'triceps-barra',
    'Tríceps no cross corda': 'triceps-corda',
    'Banco abdutor': 'cadeira-abdutora',
    'Banco extensor': 'cadeira-extensora',
    'Banco sóleo': 'panturrilha-sentado',
    'Extensão lombar no banco romano': 'extensão-lombar-no-banco-romano',
    'Pingus (Abdomen Infra)': 'pingus',
    'Frog (Pilates)': 'frog',
    'Abdomen Infra': 'abdominal-infra',
    'Abdomen Reto': 'abdominal-supra',
    'Elevação Lateral Halteres': 'elevacao-lateral',
    'Remada Alta Kettlebell': 'remada-alta',
    'Canoa Estática': 'canoa-estatica',
    'Remada Baixa Máquina': 'remada-baixa',
    'Rosca Direta Pulley': 'rosca-direta-na-polia',
    'Peck Deck Invertido': 'peck-deck-invertido',
    'Abdomen Infra (Pingus)': 'pingus',
    'Agachamento Livre Banco': 'agachamento-livre',
    'Abdomen Reto Pilates': 'abdominal-supra',
    'Elevação Frontal Halteres': 'elevação-frontal-com-halteres',
    'Extensão Lombar Livre': 'extensão-lombar',
    'Abdução Solo Pilates (Leg circles)': 'abducao-solo-pilates',
    'Elevação Pélvica Livre': 'elevação-pélvica-com-barra',
    'Remada Baixa Aberta': 'remada-baixa',
    'Rosca Direta Pulley Corda': 'rosca-direta-na-polia',
    'Serrote Halteres': 'remada-unilateral',
    'Elevação conjunta': 'elevacao-lateral',
    'Crucifixo': 'crucifixo-com-halteres',
    'Desenvolvimento Arnold': 'desenvolvimento-arnold',
    'Tríceps na caixa ou nas argolas': 'triceps-banco',
    'Supino alternado': 'supino-reto-com-halteres',
    'Flexão': 'flexão-de-braços',
    'Elevação de perna extendida': 'abdominal-infra',
    'Hip Thrust - elevação pélvica': 'elevação-pélvica-com-barra',
    'Clamshell - ostra': 'abducao-solo-pilates',
    'Deadlift': 'levantamento-terra-com-barra',
    'Stiff': 'stiff-com-barra',
    'Remada alternada': 'remada-unilateral',
    'Stiff unilateral': 'stiff-unilateral-com-halteres',
    'Sumô': 'agachamento-sumo-com-halteres',
    'Flexão de joelho em pé': 'flexora-vertical',
    'Flexão de joelho na MB': 'flexora-na-bola',
    'Wall sit': 'agachamento-isometrico',
    'Back Squat': 'agachamento-livre-com-barra',
  };

  if (manualMap[name]) return manualMap[name];

  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/\s+/g, "-")           // Espaços para hífens
    .replace(/[^a-z0-9-]/g, "")     // Remove caracteres especiais
    .replace(/-+/g, "-")            // Remove hífens duplos
    .replace(/^-|-$/g, "");         // Remove hífens no início/fim
};

/**
 * Gera variações de URLs para tentar carregar o GIF/Vídeo do exercício
 */
export const getExerciseGifUrlVariations = (exerciseName: string, originalUrl?: string): string[] => {
  const urls: string[] = [];
  
  // 1. Prioridade máxima: URL original se fornecida
  if (originalUrl) {
    urls.push(originalUrl);
  }

  const normalized = normalizeExerciseName(exerciseName);
  if (!normalized) return urls.length > 0 ? urls : ['https://picsum.photos/seed/gym/400/300'];

  // 2. Variações de base para o repositório de assets
  const baseVariations = [
    normalized,
    normalized.replace(/-/g, '_'),
    normalized.replace(/-/g, ''),
    normalized.split('-')[0] // Apenas a primeira palavra (ex: 'agachamento')
  ];

  const uniqueVariations = Array.from(new Set(baseVariations)).slice(0, 3);
  
  // 3. Extensões e pastas mais comuns
  const extensions = ['.gif', '.mp4', '.webp'];
  const folders = ['', 'assets/', 'gifs/'];
  
  // Construímos uma lista pequena e eficiente (máximo ~20 URLs)
  uniqueVariations.forEach(v => {
    const encoded = encodeURIComponent(v);
    folders.forEach(folder => {
      extensions.forEach(ext => {
        const filename = `${encoded}${ext}`;
        // GitHub Raw (Prioridade para arquivos diretos)
        urls.push(`https://raw.githubusercontent.com/Narok94/tatu-gym-assets/main/${folder}${filename}`);
      });
    });
  });

  // 4. Fallback final: jsDelivr de uma variação segura
  urls.push(`https://cdn.jsdelivr.net/gh/Narok94/tatu-gym-assets@main/assets/${encodeURIComponent(normalized)}.gif`);
  
  // Remove duplicatas e limita para não demorar demais
  return Array.from(new Set(urls)).slice(0, 12);
};

/**
 * Alias para getExerciseGifUrlVariations para compatibilidade com código antigo
 */
/**
 * Lista de nomes de arquivos GIF do Horus para correspondência precisa
 */
export const HORUS_EXERCISE_GIFS = [
  "supino_inclinado",
  "supino_reto",
  "crucifixo_maquina",
  "desenvolvimento_maquina",
  "Barra fixa",
  "abdominal_invertido",
  "abduçao_de_quadril_em_pé",
  "abraços_nos_joelhos_em_pé",
  "adução_do_quadril_com_cabo",
  "adução_do_quadril_lateral_com_alavanca",
  "afundo_com_barra",
  "afundo_com_landmine",
  "afundo_lateral_com_barra",
  "afundo_livre",
  "afundo_no_banco_com_halteres",
  "agachamento",
  "agachamento_bulgaro",
  "agachamento_com_barra_e_salto",
  "agachamento_com_barra_no_chão_seguido_de_levantamento_militar",
  "agachamento_com_barra_sobre_a_cabeça",
  "agachamento_com_salto",
  "agachamento_com_salto_ajoelhado",
  "agachamento_com_salto_usando_barra_hexagonal",
  "agachamento_com_sustentação_e_elevação_de_panturrilhas",
  "agachamento_dividido_profundo",
  "agachamento_em_plié_com_halteres",
  "agachamento_goblet_com_kettlebell_e_faixa_elástica",
  "agachamento_na_maquina",
  "agachamento_na_parede_com_bola_de_exercício",
  "agachamento_no_banco_com_peso_corporal",
  "agachamento_pistola_com_apoio_em_caixa",
  "agachamento_pistola_na_caixa",
  "agachamento_skater",
  "agachamento_sumô_sem_pesos",
  "agachamento_unilateral_cruzado",
  "airbike",
  "alongamento_1",
  "alongamento_10",
  "alongamento_11",
  "alongamento_12",
  "alongamento_13",
  "alongamento_2",
  "alongamento_3",
  "alongamento_4",
  "alongamento_5",
  "alongamento_6",
  "alongamento_7",
  "alongamento_8",
  "alongamento_9",
  "alongamento_assistido_reverso_(peitoral_e_ombro)",
  "alongamento_borboleta",
  "alongamento_com_pvc_na_posição_frontal_de_rack",
  "alongamento_da_esfinge",
  "alongamento_da_panturrilha_agachado",
  "alongamento_da_panturrilha_com_descida_do_calcanhar",
  "alongamento_da_parte_superior_das_costas",
  "alongamento_das_costas_com_rolo_de_espuma",
  "alongamento_de_adutores_com_pernas_afastadas_em_pé",
  "alongamento_de_glúteos_deitado",
  "alongamento_de_isquiotibiais_deitado",
  "alongamento_de_isquiotibiais_em_pé",
  "alongamento_de_ombro_com_o_braço_cruzado",
  "alongamento_de_ombro_reverso_em_pé",
  "alongamento_de_panturrilha_com_corda",
  "alongamento_de_panturrilha_com_uma_perna",
  "alongamento_de_panturrilha_com_uma_perna_esticada",
  "alongamento_de_panturrilha_em_passo_largo",
  "alongamento_de_panturrilha_na_parede",
  "alongamento_de_rotação_da_coluna_em_pé",
  "alongamento_do_peito_e_parte_frontal_dos_ombros",
  "alongamento_do_piriforme_sentado",
  "alongamento_dos_adutores_com_a_perna_estendida_ajoelhado",
  "alongamento_dos_adutores_com_pernas_abertas_em_pé",
  "alongamento_dos_adutores_da_coxa_com_rolo_de_espuma",
  "alongamento_dos_adutores_em_posição_sentada_com_pernas_abertas",
  "alongamento_dos_adutores_sentado",
  "alongamento_dos_extensores_dos_dedos_dos_pés",
  "alongamento_dos_flexores_de_quadril_ajoelhado",
  "alongamento_dos_flexores_do_quadril_em_posição_de_joelho",
  "alongamento_dos_flexores_dos_dedos_dos_pés_em_pé",
  "alongamento_dos_isquiotibiais_em_pé",
  "alongamento_dos_isquiotibiais_em_pé_com_a_perna_cruzada",
  "alongamento_dos_isquiotibiais_sentado",
  "alongamento_dos_ombros_por_trás_das_costas",
  "alongamento_em_pé_dos_quadríceps",
  "alongamento_inclinado_lateral_em_pé",
  "alongamento_lateral_da_parte_interna_da_coxa",
  "alongamento_piriforme",
  "alongamento_reverso_assistido_(peito_e_ombro)",
  "alongamento_sentado_para_a_panturrilha_com_perna_esticada",
  "andar_de_bicicleta_ao_ar_livre",
  "antebraço_apoiado_no_banco",
  "antebraço_barra_costas",
  "antebraço_barra_frente",
  "antebraço_com_anilhas",
  "antebraço_movimento_enrrolar",
  "apoio_de_frente_pegada_fechada_parede",
  "arnold_dips-maschine",
  "arranco_com_kettlebell_de_um_braço",
  "arranque_e_arremesso_com_kettlebell",
  "arremesso_com_barra",
  "arremesso_de_bola_de_reação",
  "arremesso_de_medicina_bola_com_levantamento_de_tronco",
  "avanço_com_joelho_alto_em_cima_da_bola_bosu",
  "avanço_com_joelho_elevado_em_caminhada",
  "avanço_sem_peso_corporal",
  "balanço_com_gymstick",
  "balloon_drill",
  "bandeira_humana",
  "barra_fixa",
  "barra_fixa_1",
  "barra_fixa_2",
  "barra_fixa_3",
  "barra_fixa_4",
  "barra_fixa_5",
  "barra_fixa_6",
  "barra_fixa_7",
  "barra_fixa_8",
  "barra_fixa_assistida",
  "barra_fixa_com_peso",
  "barra_fixa_unilateral_assistida",
  "barra_livre_pegada_aberta",
  "barra_livre_pegada_aberta_joelhos_flexionados",
  "bicicleta_ergométrica_reclinada",
  "bike",
  "bola_medicinal_lançada_para_cima_e_para_baixo",
  "bola_na_parede",
  "bom_dia_com_faixa_elástica_de_resistência",
  "boxe_jab",
  "boxe_sombra",
  "burpees",
  "cadeira_abdutora_em_pé",
  "caminhada_na_parada_de_mão",
  "caminhada_na_parede",
  "caminhar",
  "cardio_de_passos_de_boxeador",
  "carregamento_zercher",
  "corrida",
  "corrida_com_elevação_dos_joelhos",
  "corrida_com_salto",
  "corrida_latera",
  "corrida_para_trás",
  "crucifixo_invertido_com_gymstick_para_deltoides_posterior",
  "crucifixo_suspenso",
  "crunch_declinado",
  "cruz_de_ferro_com_halteres",
  "cruzado_de_direita",
  "cópia_de_abdominal_de_rã_com_bola_de_exercícios",
  "desenvolvimento_de_ombro_com_kettlebell",
  "desvio_radial",
  "dumbbell_devil_press",
  "dumbbell_power_clean",
  "elevacao_de_joelhos_suspenso",
  "elevacao_de_panturrilha_em_pe_unilateral",
  "elevacao_de_panturrilha_na_plataforma",
  "elevacao_de_quadril_com_pes_no_banco",
  "elevacao_pelvica",
  "elevação_de_panturrilha_em_uma_perna",
  "elevação_de_perna_única_com_equilíbrio_e_rosca_de_bíceps",
  "elevação_de_pernas_deitado_de_lado",
  "elevação_de_pernas_estilo_sapo",
  "elevação_de_quadril_com_banda_de_resistência_de_joelhos",
  "elevação_de_quadril_com_peso_corporal",
  "elevação_frontal_lateral_com_elástico",
  "elevação_lateral_de_braços",
  "elevação_lateral_de_perna_com_faixa_elástica",
  "elevação_lateral_de_perna_com_faixa_elástica_deitado_de_lado",
  "elevação_pelvica_com_barra",
  "elevação_pelvica_com_halter",
  "elevação_pelvica_livre",
  "elevação_pélvica_com_banda_de_resistência",
  "elevação_pélvica_declinado",
  "encolhimento_em_paralelas",
  "enge_klimmzuege_obergriff",
  "escalador_de_montanha",
  "esquiador_com_gymstick",
  "exercício_pliométrico_x",
  "exercícios_das_5_marcas",
  "exercícios_de_escada_de_agilidade",
  "exercícios_de_escada_de_agilidade_lateral",
  "extensao_de_quadril_em_pe",
  "extensao_de_triceps_na_parede",
  "extensão_de_glúteo_em_pé",
  "extensão_de_ombro_com_faixa",
  "extensão_de_perna_em_pé_com_faixa_de_resistência",
  "extensão_de_perna_reta",
  "extensão_de_pernas_com_faixa_elástica_sentado",
  "extensão_de_pernas_sentado_com_faixa_de_resistência",
  "extensão_de_quadril_em_pé_com_joelhos_flexionados",
  "extensão_de_quadril_em_pé_na_polia",
  "extensão_de_tríceps_com_barra_w_inclinada",
  "extensão_de_tríceps_com_cabo_ajoelhado",
  "extensão_de_tríceps_com_cabo_em_posição_ajoelhada",
  "extensão_de_tríceps_com_cabo_inclinado",
  "extensão_de_tríceps_com_haltere_em_pronação_com_um_braço",
  "extensão_de_tríceps_com_haltere_unilateral_sentado",
  "extensão_de_tríceps_com_pegada_invertida",
  "extensão_de_tríceps_com_um_braço",
  "extensão_de_tríceps_com_uma_mão_no_pulley_alto_sobre_a_cabeça",
  "extensão_de_tríceps_deitado_com_barra_w_pegada_fechada_atrás_da_cabeça",
  "extensão_de_tríceps_deitado_com_corda",
  "extensão_de_tríceps_invertida_com_unilateral",
  "extensão_de_tríceps_lateral_com_cabo",
  "extensão_de_tríceps_na_máquina",
  "extensão_de_tríceps_na_máquina_pegada_neutra",
  "extensão_de_tríceps_no_cabo_alto",
  "extensão_de_tríceps_no_cabo_deitado",
  "extensão_de_tríceps_testa_declinado_fechado",
  "fitness_gifs_4_u",
  "flexao",
  "flexao_1",
  "flexao_arqueiro",
  "flexao_de_braco",
  "flexao_de_braco_1",
  "flexao_de_braco_com_bola_medicinal",
  "flexao_de_bracos",
  "flexao_de_joelhos",
  "flexao_de_joelhos_1",
  "flexao_declinada",
  "flexao_inclinada",
  "flexao_pike",
  "flexao_pike_elevada",
  "flexao_pike_pes_elevados",
  "flexao_suspensa",
  "flexao_unilateral_na_bola_medicinal",
  "flexão",
  "flexão_com_kettlebell_profunda",
  "flexão_com_parada_de_mãos",
  "flexão_de_apoio_com_elevação_de_braço",
  "flexão_de_braço_com_as_mãos_entre_bancos",
  "flexão_de_braço_com_bola_de_estabilidade",
  "flexão_de_braço_com_bola_medicinal_em_um_braço",
  "flexão_de_joelhos",
  "flexão_de_parede",
  "flexão_de_pernas_com_faixa_elástica",
  "flexão_de_pernas_com_toalha",
  "flexão_de_pernas_deitado_com_faixa_elástica",
  "flexão_de_pernas_na_bola_de_estabilidade",
  "flexão_de_punho_com_cabo_em_um_braço_no_chão",
  "flexão_de_punho_com_halteres(1)",
  "flexão_de_punho_reversa_com_anilha",
  "flexão_de_punho_reversa_com_barra_sobre_um_banco",
  "flexão_hindu_modificada",
  "gancho_de_direita",
  "glúteo_coice_com_gymstick",
  "glúteo_coice_com_pernas_flexionada_com_faixa",
  "glúteo_coice_em_pé_com_faixa_elástica",
  "glúteos_coice_com_faixa_elástica",
  "hiperextensão_de_punho_com_barra",
  "hiperextensão_do_tronco",
  "hiperextensão_reversa_com_faixa_de_resistência",
  "impulso_com_barra",
  "inclinação_pélvica",
  "joelho_alternado_no_peito",
  "joelhos_altos_contra_a_parede",
  "kettlebell_em_forma_de_oito",
  "kick_back",
  "lançamento_de_bola_medicinal",
  "lançamento_de_bola_medicinal_deitado",
  "leg_press",
  "leg_press_alternado_deitado_com_gymstick",
  "leg_press_pés_afastados",
  "levantamento_lateral_de_perna_em_quatro_apoios",
  "levantamento_terra",
  "levantamento_terra_com_barra",
  "levantamento_terra_romeno",
  "levantamento_terrra_com_halteres_frente",
  "medicine_ball_rotational_throw",
  "mergulho_de_tríceps_com_alavanca",
  "mergulho_em_bancos",
  "mergulho_reverso",
  "mergulhos_assistidos_para_tríceps",
  "mesa_flex",
  "minhoca",
  "muscle_up",
  "máquina_de_flexão_de_tríceps",
  "máquina_de_remo",
  "nave_seal_burpee",
  "panturrilha_com_halteres",
  "panturrilha_maquina",
  "panturrilha_no_leg_press_45",
  "panturrilha_sentado",
  "paralelas_na_barra",
  "passada_a_frente_com_halteres",
  "passagem_de_bola_medicinal_de_peito_em_pé",
  "passo_de_esqui",
  "passo_invertido_com_elevação_do_joelho",
  "polichinelos",
  "ponte_de_gluteos_com_pes_elevados",
  "ponte_em_unilateral",
  "prancha",
  "protração_e_retração_da_escápula",
  "pular_corda",
  "pull_over_com_barra",
  "pull_over_na_polia_com_corda",
  "pull_up",
  "pulldown_com_corda",
  "pulldown_inclinado_com_corda",
  "pulldown_unilateral_no_cabo",
  "pulley_costa_maquina",
  "pulley_costa_unilateral",
  "pulley_frente_pegada_supinada",
  "pulley_pegada_aberta_atras_da_nuca",
  "pulley_pegada_aberta_pronada",
  "pullover_com_barra",
  "pullover_com_barra_no_banco_declinado",
  "pullover_com_barra_w_pegada_invertida",
  "pullover_com_cabo",
  "pullover_com_cabo_sentado",
  "pullover_na_máquina_de_alavanca",
  "pulo_de_impulso_de_quadril_de_uma_perna",
  "pulos_com_abertura_de_pernas",
  "puxada_alta_com_alavanca",
  "puxada_alta_com_triângulo",
  "puxada_alta_com_um_joelho_apoiado",
  "puxada_com_halteres_entre_as_pernas",
  "puxada_isométrica",
  "puxador_costas_por_trás_máquina",
  "pêndulo_de_ombro",
  "remada_aberta_no_banco_inclinado_com_halteres",
  "remada_baixa_no_pulley_pegada_aberta_supinada",
  "remada_baixa_unilateral_pegada_neutra",
  "remada_cavalinho_unilateral",
  "remada_cavalino_com_barra",
  "remada_inclinada_com_pegada_reversa_com_halteres",
  "remada_inclinada_no_banco_com_cabo",
  "remada_inclinda_no_banco_pegada_supinda_puxada_fechada",
  "remada_invertida",
  "remada_invertida_na_mesa",
  "remada_maquina_pronada",
  "remada_renegada_com_halteres",
  "remada_sentada_com_anilhas",
  "remada_sentada_com_cabo",
  "remada_sentada_com_corda_na_polia",
  "remada_sentada_na_máquina",
  "remada_sentado_com_cabo_pegada_fechada",
  "remada_t_com_alavanca",
  "remada_t_com_landmine",
  "remada_t_invertida_com_alavanca",
  "remada_unilateral_com_barra",
  "remada_unilateral_com_barra_landmine",
  "remada_unilateral_com_cabo",
  "rosca_bíceps_com_faixa_elástica",
  "rosca_concentrada_com_perna",
  "rosca_de_punho_com_barra",
  "rotação_do_corpo_superior_deitado",
  "rotação_espinhal_deitado",
  "rotação_externa_com_cabo_a_90_graus",
  "rotação_externa_de_ombro_com_faixa_elástica",
  "rotação_externa_de_quadril_com_faixa_elástica",
  "rotação_externa_de_quadril_sentado_com_faixa_elástica",
  "rotação_externa_do_ombro",
  "rotação_externa_do_ombro_deitado_com_haltere",
  "rotação_externa_do_pé_com_faixa_elástica",
  "rotação_interna_de_cabo_a_90_graus",
  "rotação_interna_de_ombro_com_cabo",
  "rotação_interna_do_ombro",
  "rotação_interna_do_ombro_sentada_com_cabo",
  "rotação_interna_do_quadril_sentado_com_faixa_elástica",
  "rotação_para_trás_de_joelhos",
  "salto_com_joelhos_flexionados",
  "salto_em_caixa_com_uma_perna",
  "salto_em_distância",
  "salto_na_caixa",
  "salto_na_caixa_para_agachamento_pistola",
  "salto_para_caixa_2_para_1",
  "saltos_de_afastamento",
  "saltos_em_tesoura",
  "saltos_potentes",
  "seitlicher_ausfallschritt_mit_langhantel",
  "serrote",
  "soco_direto_de_direita",
  "socos",
  "stiff_com_halteres",
  "stiff_no_smth_unilateral",
  "stiff_unilateral",
  "superman",
  "supino_declinado_no_smit",
  "supino_em_pé_com_faixa_elástica",
  "suspensão_passiva",
  "swimming",
  "swing_360",
  "tesoura_de_braços",
  "toque_lateral_dos_dedos_dos_pés_em_pé",
  "toque_nos_dedos_dos_pés_em_pé",
  "toque_nos_dedos_dos_pés_sentado",
  "toques_de_dedos_em_pé",
  "torção_oblíqua_sentada",
  "torções_do_cotovelo_para_o_joelho",
  "tração_lateral_com_elástico",
  "triceps",
  "triceps_apoaiado_na_pareda",
  "triceps_com_halteres_no_banco_reto",
  "triceps_extenção_de_cotovelo_unilateral",
  "triceps_frances_barra_w",
  "triceps_françes_bilateral_no_cross",
  "triceps_françes_unilateral_no_corss",
  "triceps_inclinado_no_cross_bilateral",
  "triceps_no_aparelho_scort",
  "triceps_paralelo_no_banco",
  "triceps_patada_blateral_com_halteres",
  "triceps_patada_unilateral_com_halteres",
  "triceps_pegada_pronada_uniatres_no_cross",
  "triceps_testa_pegada_neutra_deitado_no_banco",
  "tríceps_francês_com_faixa_elástica_acima_da_cabeça",
  "tríceps_francês_com_halter_bilateral",
  "tríceps_francês_em_pé_com_gymstick",
  "tríceps_testa_com_faixa_elástica",
  "v-up_com_bola_de_estabilidade",
  "wall_sit",
  "wall_sit_com_inclinação_de_tronco"
];

export const getExerciseGifUrl = (exerciseName: string, originalUrl?: string): string => {
  return getHorusGifUrl(exerciseName);
};

/**
 * Retorna o caminho relativo estrito do GIF seguindo as diretrizes de mapeamento kebab-case
 */
export const getHorusGifUrl = (name: string): string => {
  if (!name) return '';

  // Dicionário de sinônimos/atalhos manuais para garantir que os nomes usados no banco encontrem o GIF exato
  const synonyms: Record<string, string> = {
    'pingus': 'abdominal-invertido',
    'frog': 'v-up-com-bola-de-estabilidade',
    'one hundred': 'abdominal-invertido',
    'single leg stretch': 'alongamento-de-isquiotibiais-deitado',
    'double leg stretch': 'alongamento-de-isquiotibiais-deitado',
    'elevacao pelvica solo': 'elevacao-pelvica-com-barra',
    'agachamento livre banco': 'agachamento-no-banco-com-peso-corporal',
    'agachamento livre': 'agachamento-no-banco-com-peso-corporal',
    'cadeira adutora': 'aducao-do-quadril-com-cabo',
    'afundo': 'afundo-livre',
    'cadeira extensora': 'extensao-de-pernas-com-faixa-elastica-sentado',
    'extensora': 'extensao-de-pernas-com-faixa-elastica-sentado',
    'panturrilha em pe': 'elevacao-de-panturrilha-em-pe-unilateral',
    'abdomen reto': 'abdominal-invertido',
    'elevacao lateral halteres': 'elevacao-lateral-de-bracos',
    'elevacao lateral': 'elevacao-lateral-de-bracos',
    'supino maquina': 'supino-declinado-no-smit',
    'desenvolvimento maquina pegada neutra': 'desenvolvimento_maquina',
    'desenvolvimento': 'desenvolvimento-de-ombro-com-kettlebell',
    'peck deck': 'crucifixo-suspenso',
    'remada alta kettlebell': 'puxada-alta-com-alavanca',
    'abducao solo pilates': 'elevacao-lateral-de-perna-com-faixa-elastica-deitado-de-lado',
    'stiff barra': 'stiff-com-halteres',
    'stiff': 'stiff-com-halteres',
    'gluteo maquina coice': 'gluteos-coice-com-faixa-elastica',
    'cadeira flexora': 'mesa-flex',
    'flexora': 'mesa-flex',
    'elevacao pelvica': 'elevacao-pelvica',
    'canoa estatica': 'prancha',
    'puxada supinada': 'pulley-frente-pegada-supinada',
    'triceps pulley barra w': 'triceps',
    'triceps corda': 'extensao-de-triceps-deitado-com-corda',
    'remada baixa maquina': 'remada-sentada-na-maquina',
    'remada baixa': 'remada-sentada-na-maquina',
    'rosca direta pulley': 'rosca-biceps-com-faixa-elastica',
    'rosca direta': 'rosca-biceps-com-faixa-elastica',
    'peck deck invertido': 'crucifixo-invertido-com-gymstick-para-deltoides-posterior',
    'manguito rotador polia': 'rotacao-externa-com-cabo-a-90-graus',
    'supino inclinado maquina ou halteres': 'supino_inclinado',
    'supino reto maquina ou halteres': 'supino_reto',
    'crucifixo maquina': 'crucifixo_maquina',
    'desenvolvimento maquina': 'desenvolvimento_maquina',
    'elevacao lateral no cabo': 'elevacao-frontal-lateral-com-elastico',
    'triceps frances unilateral': 'triceps-frances-unilateral-no-corss',
    'abdomen supra': 'abdominal-invertido',
    'puxada alta aberta': 'pulley-pegada-aberta-pronada',
    'pull down unilateral': 'pulldown-unilateral-no-cabo',
    'remada baixa neutra': 'remada-sentado-com-cabo-pegada-fechada',
    'remada articulada peito apoiado': 'remada-sentada-na-maquina',
    'face pull': 'crucifixo-invertido-com-gymstick-para-deltoides-posterior',
    'encolhimento halteres': 'encolhimento-em-paralelas',
    'encolhimento barra guiada': 'encolhimento-em-paralelas',
    'rosca martelo': 'rosca-biceps-com-faixa-elastica',
    'rosca direta barra w': 'rosca-biceps-com-faixa-elastica',
    'agachamento smith': 'agachamento-na-maquina',
    'elevacao de pernas': 'elevacao-de-pernas-estilo-sapo',
    'vacuum abdominal': 'abdominal-invertido',
    'supino reto': 'triceps-com-halteres-no-banco-reto',
    'elevacao conjunta': 'elevacao-lateral-de-bracos',
    'triceps frances': 'triceps-frances-com-faixa-elastica-acima-da-cabeca',
    'crucifixo': 'crucifixo-suspenso',
    'desenvolvimento arnold': 'desenvolvimento-de-ombro-com-kettlebell',
    'triceps na caixa ou nas argolas': 'mergulho-em-bancos',
    'supino alternado': 'triceps-com-halteres-no-banco-reto',
    'flexao': 'flexao',
    'eleveção de perna extendida': 'elevacao-de-pernas-estilo-sapo',
    'hip thrust - elevação pélvica': 'elevacao-pelvica-com-barra',
    'clamshell - ostra': 'abducao-de-quadril-em-pe',
    'deadlift': 'levantamento-terra-com-barra',
    'remada alternada': 'remada-unilateral-com-barra',
    'stiff unilateral': 'stiff-unilateral',
    'sumo': 'agachamento-unilateral-cruzado',
    'flexao de joelho em pe': 'flexao-de-joelhos',
    'flexao de joelho na mb': 'flexao-de-pernas-na-bola-de-estabilidade',
    'wall sit': 'wall-sit'
  };

  const cleanName = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-_]/g, "")
    .trim();

  // Função auxiliar para calcular o melhor match em HORUS_EXERCISE_GIFS
  const findBestMatch = (query: string) => {
    const queryNormalized = query.replace(/[\s\._\-]+/g, " ");
    const inputWords = queryNormalized.split(" ").filter(w => w.length > 0);
    
    if (inputWords.length === 0) return { bestGif: '', highestScore: 0 };

    let bestGif = '';
    let highestScore = 0;

    for (const gif of HORUS_EXERCISE_GIFS) {
      let score = 0;
      const gifNormalized = gif
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9\s-_]/g, " ")
        .trim();
        
      const gifWords = gifNormalized.split(/[\s-_]+/);

      for (const w of inputWords) {
        if (gifWords.includes(w)) {
          score += 2;
        } else if (gifNormalized.includes(w)) {
          score += 1;
        }
      }

      if (inputWords[0] && gifWords[0] === inputWords[0]) {
        score += 1.5;
      }

      if (score > highestScore) {
        highestScore = score;
        bestGif = gif;
      }
    }
    return { bestGif, highestScore };
  };

  
  // 1. Tentar sinônimos exatos primeiro
  if (synonyms[cleanName]) {
    const directMatch = findBestMatch(synonyms[cleanName]);
    if (directMatch.highestScore > 0) {
      return `https://raw.githubusercontent.com/Narok94/Horus2.0/main/public/${encodeURIComponent(directMatch.bestGif)}.gif`;
    }
  }

  // 2. Busca direta
  let match = findBestMatch(cleanName);


  // 2. Tentar sinônimos se a busca direta for fraca
  if (match.highestScore < 4) {
    let searchName = cleanName;
    if (synonyms[cleanName]) {
      searchName = synonyms[cleanName];
    } else {
      for (const key of Object.keys(synonyms)) {
        if (cleanName.includes(key)) {
          searchName = synonyms[key];
          break;
        }
      }
    }
    const synonymMatch = findBestMatch(searchName);
    if (synonymMatch.highestScore > match.highestScore) {
      match = synonymMatch;
    }
  }

  // Se encontramos alguma correspondência razoável (score > 1)
  if (match.highestScore > 1 && match.bestGif) {
    const encodedGif = encodeURIComponent(match.bestGif);
    return `https://raw.githubusercontent.com/Narok94/Horus2.0/main/public/${encodedGif}.gif`;
  }

  // Último recurso: normalizar
  const finalNormalized = cleanName.replace(/[\s\._\-]+/g, "_");
  return `https://raw.githubusercontent.com/Narok94/Horus2.0/main/public/${finalNormalized}.gif`;
};

export interface DetailedExerciseInfo {
  gif: string;
  instructions: string;
  muscles: string;
  technique: string;
  correctExecution: string;
  tips: string[];
  intensity: string;
}

export const getExerciseDetails = (name: string, muscleGroup = 'Geral'): DetailedExerciseInfo => {
  const gif = getHorusGifUrl(name);
  const mLower = (muscleGroup || '').toLowerCase();
  const nLower = name.toLowerCase();

  // Determine standard templates based on muscles or names
  if (mLower.includes('peito') || mLower.includes('peitoral')) {
    return {
      gif,
      instructions: "Mantenha o peito aberto, retraia as escápulas e empurre com potência, controlando o retorno.",
      muscles: "Peitoral Maior, Deltoide Anterior, Cabeça Lateral do Tríceps",
      technique: "Estabilize os ombros contra o banco o tempo todo. Evite esticar os braços ao ponto de relaxar os peitorais.",
      correctExecution: "Desça de forma progressiva e lenta por 3 segundos até sentir as fibras do peitoral alongarem por completo, depois empurre com explosão muscular.",
      tips: [
        "Foque em aproximar os bíceps na subida para contração e esmagamento total das fibras.",
        "Não bata as cargas no topo para reter a tensão constante."
      ],
      intensity: "Sobrecarga Progressiva • RPE 9 (perto da falha)"
    };
  }

  if (mLower.includes('costas') || mLower.includes('dorsal') || mLower.includes('tração') || nLower.includes('puxada') || nLower.includes('remada') || nLower.includes('serrote')) {
    return {
      gif,
      instructions: "Inicie o movimento puxando com os cotovelos e contraia as escápulas ao final da puxada.",
      muscles: "Latíssimo do Dorso, Trapézio, Redondo Maior, Deltoide Posterior e Bíceps Braquial",
      technique: "Evite balançar os quadris ou inclinar o tronco excessivamente. O peito deve permanecer aberto e estufado.",
      correctExecution: "Alongue completamente os braços na subida sentindo esticar o dorsal, e puxe esmagando as costas no pico de contração máxima por 1s.",
      tips: [
        "Imagine as suas mãos apenas como ganchos e puxe diretamente direcionando a força pelos cotovelos.",
        "Mantenha os ombros abaixados para evitar tensão desnecessária no trapézio superior."
      ],
      intensity: "Volume de Alto Estresse • RPE 8.5 (Foco em esforço excêntrico e contração prolongada)"
    };
  }

  if (mLower.includes('pernas') || mLower.includes('quadríceps') || mLower.includes('quadriceps') || mLower.includes('posterior') || mLower.includes('glúteo') || mLower.includes('gluteo') || mLower.includes('panturrilha') || nLower.includes('agachamento') || nLower.includes('leg press') || nLower.includes('stiff')) {
    return {
      gif,
      instructions: "Mantenha o calcanhar apoiado com firmeza e desça direcionando os joelhos para fora na linha dos pés.",
      muscles: "Quadríceps Femoral, Glúteo Máximo, Isquiotibiais, Eretores da Espinha",
      technique: "Mantenha o abdômen contraído o tempo inteiro para dar suporte à coluna lombar. Evite retroversão pélvica.",
      correctExecution: "Desça na amplitude completa mantendo a coluna firme e neutra. Empurre contra o chão espalhando a força pelos calcanhares na subida.",
      tips: [
        "Mantenha o alinhamento perfeito do joelho com os dedos do pé para estabilidade articular total.",
        "A descida controlada é o principal fator de ativação profunda de quadríceps e glúteos."
      ],
      intensity: "Estresse tensional máximo • RPE 9 (Foco na amplitude com sobriedade e técnica)"
    };
  }

  if (mLower.includes('ombro') || mLower.includes('deltoide') || nLower.includes('desenvolvimento') || nLower.includes('lateral') || nLower.includes('frontal')) {
    return {
      gif,
      instructions: "Abra os braços levemente à frente na linha escapular e erga os halteres sem encolher o pescoço.",
      muscles: "Deltoide Lateral, Deltoide Anterior, Trapézio e Serrátil",
      technique: "Não use impulsos dinâmicos do tronco inferior. O isolamento dos ombros requer corpo firme.",
      correctExecution: "Eleve os braços até a altura da linha paralela dos ombros, segure por 0.5s e desça segurando o peso de forma progressiva.",
      tips: [
        "Incline o tronco ligeiramente para a frente para alinhar o deltoide lateral perfeitamente contra a gravidade.",
        "Não trave as articulações no topo nos movimentos de empurrar."
      ],
      intensity: "Tensão de Isolamento • RPE 8 (Repetições estritas de alta qualidade)"
    };
  }

  if (mLower.includes('tríceps') || mLower.includes('triceps')) {
    return {
      gif,
      instructions: "Cole os cotovelos fixados na lateral das costelas e estenda completamente os antebraços.",
      muscles: "Tríceps Braquial (Cabeça Longa, Cabeça Lateral e Cabeça Medial)",
      technique: "Não use os ombros ou tronco superior para ajudar. Apenas o cotovelo deve mexer.",
      correctExecution: "Estenda completamente os braços contraindo com força o tríceps por 1 segundo, retorne controlando a subida em 3 segundos.",
      tips: [
        "No tríceps corda, afaste as pontas da corda na parte mais baixa para atingir contração e isolamento máximos.",
        "Mantenha os punhos firmes e travados."
      ],
      intensity: "Pump e Tensão Localizada • RPE 8.5 (Foco em queimação e densidade muscular)"
    };
  }

  if (mLower.includes('bíceps') || mLower.includes('biceps') || nLower.includes('rosca') || nLower.includes('martelo')) {
    return {
      gif,
      instructions: "Mantenha os cotovelos alinhados e suba a carga girando levemente as palmas para o teto.",
      muscles: "Bíceps Braquial, Braquial Anterior e Braquiorradial",
      technique: "Evite jogar os cotovelos para trás na subida para não transferir carga para a porção do ombro.",
      correctExecution: "Erga controladamente focado no bíceps, esmague no pico por 1s e retorne na descida completa sem relaxar e mantendo o músculo engajado.",
      tips: [
        "Gire levemente o dedo mindinho para fora no topo da rosca alternada para contrair ainda mais o pico do bíceps.",
        "Use uma base sólida com pernas levemente flexionadas."
      ],
      intensity: "Densidade Miofibrilar • RPE 8 (Repetições curadas com foco concêntrico e excêntrico estrito)"
    };
  }

  // Fallback for general CORE / Abdômen or unspecified
  return {
    gif,
    instructions: "Contraia o abdômen e estabilize os quadris, movimentando-se com amplitude e expiração ativa.",
    muscles: "CORE, Reto Abdominal, Oblíquo Interno/Externo e Estabilizadores Globais",
    technique: "Evite tensionar o pescoço ou puxar a cervical com as mãos. Toda força deve emanar do abdômen.",
    correctExecution: "Expulse todo o ar das vias respiratórias no topo do abdômen para forçar uma contração profunda do transverso abdominal.",
    tips: [
      "No vacuum ou prancha, mantenha a conexão mente-músculo apertando toda musculatura profunda.",
      "A respiração correta é o segredo para um abdômen estético e funcional."
    ],
    intensity: "Controle Neuromuscular • RPE 9.5 (Ativação profunda de estabilização postural)"
  };
};
