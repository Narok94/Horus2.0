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

  // 1.5 URLs do repositório Horus2.0 usando o nome exato e primeira letra maiúscula
  urls.push(`https://raw.githubusercontent.com/Narok94/Horus2.0/main/assets/gifs/${encodeURIComponent(exerciseName)}.gif`);
  const firstLetterCap = exerciseName.charAt(0).toUpperCase() + exerciseName.slice(1);
  if (firstLetterCap !== exerciseName) {
    urls.push(`https://raw.githubusercontent.com/Narok94/Horus2.0/main/assets/gifs/${encodeURIComponent(firstLetterCap)}.gif`);
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
  
  // 3. Extensões e pastas mais comuns (Tatu Gym Assets legacy / Horus 2.0)
  const extensions = ['.gif', '.mp4', '.webp'];
  const repos = [
    'Narok94/Horus2.0/main/assets/gifs/',
    'Narok94/Horus2.0/main/assets/',
    'Narok94/tatu-gym-assets/main/assets/',
    'Narok94/tatu-gym-assets/main/gifs/'
  ];
  
  // Construímos uma lista pequena e eficiente (máximo ~20 URLs)
  uniqueVariations.forEach(v => {
    const encoded = encodeURIComponent(v);
    repos.forEach(repoPath => {
      extensions.forEach(ext => {
        const filename = `${encoded}${ext}`;
        urls.push(`https://raw.githubusercontent.com/${repoPath}${filename}`);
      });
    });
  });

  urls.push(`https://cdn.jsdelivr.net/gh/Narok94/Horus2.0@main/assets/gifs/${encodeURIComponent(exerciseName)}.gif`);
  
  // Remove duplicatas e limita para não demorar demais
  return Array.from(new Set(urls)).slice(0, 15);
};

/**
 * Alias para getExerciseGifUrlVariations para compatibilidade com código antigo
 */
export const getExerciseGifUrl = (exerciseName: string, originalUrl?: string): string => {
  const variations = getExerciseGifUrlVariations(exerciseName, originalUrl);
  return variations[0] || 'https://picsum.photos/seed/gym/400/300';
};
