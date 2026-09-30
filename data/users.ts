import { User, DietPlan } from '../types';

export const henriqueDietPlan: DietPlan = {
  nutritionist: { name: "Karine Calixto Braga Lino", crn: "28995", contact: "karine.calixtob@gmail.com" },
  createdAt: "2026-07-20",
  generalGuidelines: "Melhorar composição corporal. Bater meta de água todos os dias. Musculação 5x semana. Liberado 1 a 2 refeições livres por semana.",
  meals: [
    {
      id: "cafe-manha",
      time: "08:30",
      name: "Café da manhã",
      items: [
        { food: "Pão integral", quantity: "2 fatias", alternatives: ["1 unidade de pão de sal"] },
        { food: "Ovos", quantity: "2 unidades", alternatives: ["60g de frango desfiado"] },
        { food: "Requeijão light", quantity: "1 colher de sopa" },
        { food: "Café", quantity: "1 xícara" },
        { food: "Maçã", quantity: "1 unidade", alternatives: ["pera", "200g de melancia", "200g de mamão"] }
      ],
      obs: "Pão + recheio proteico + café sem açúcar. Marcas de pão: Wickbold, Newbread ou Delícias do Trigo.",
      completed: false
    },
    {
      id: "lanche-manha",
      time: "11:00",
      name: "Lanche da manhã",
      items: [
        { food: "Whey Protein", quantity: "30g" },
        { food: "Leite de vaca desnatado", quantity: "200ml" }
      ],
      completed: false
    },
    {
      id: "almoco",
      time: "13:30",
      name: "Almoço",
      items: [
        { food: "Arroz", quantity: "150g" },
        { food: "Feijão", quantity: "100g" },
        { food: "Carne bovina", quantity: "130g", alternatives: ["Frango"] },
        { food: "Legumes cozidos", quantity: "80g" },
        { food: "Salada ou verdura crua", quantity: "à vontade" }
      ],
      obs: "Variar cores dos legumes ao máximo, no mínimo 3 opções diferentes, até 3 colheres de sopa de cada. Folhas cruas à vontade. Escolher pelo menos 1 folha, 1 legume cru e 1 cozido. Ex: alface roxa, cenoura ralada e berinjela refogada.",
      completed: false
    },
    {
      id: "lanche-tarde",
      time: "17:30",
      name: "Lanche da tarde",
      items: [
        { food: "Ovo de galinha", quantity: "2 unidades" },
        { food: "Tapioca de goma", quantity: "1 colher de sopa (15g)" },
        { food: "Mussarela", quantity: "1 fatia", alternatives: ["1 colher de sobremesa de requeijão light"] },
        { food: "Café sem açúcar", quantity: "1 xícara" }
      ],
      obs: "Crepioca: misture os ovos com a tapioca, depois recheie com uma das opções acima.",
      completed: false
    },
    {
      id: "jantar",
      time: "20:30",
      name: "Jantar",
      items: [
        { food: "Arroz", quantity: "150g" },
        { food: "Feijão", quantity: "100g" },
        { food: "Carne bovina", quantity: "100g", alternatives: ["Frango"] },
        { food: "Legumes cozidos", quantity: "80g" }
      ],
      completed: false
    }
  ],
  substitutions: [
    {
      name: "Substituição 1 (Jantar)",
      items: [
        { food: "Cuscuz de milho", quantity: "150g" },
        { food: "Frango desfiado", quantity: "100g", alternatives: ["carne"] },
        { food: "Salada ou verdura crua", quantity: "meio prato cheio" }
      ],
      obs: "Cuscuz recheado."
    }
  ]
};

export const jessicaDietPlan: DietPlan = {
  nutritionist: { name: "Karine Calixto Braga Lino", crn: "28995", contact: "karine.calixtob@gmail.com" },
  createdAt: "2026-07-20",
  generalGuidelines: "Emagrecimento (meta inicial: 78kg). Bater meta de água todos os dias. Atividade física no mínimo 4x na semana. Liberado 1 a 2 refeições livres por semana.",
  meals: [
    {
      id: "cafe-manha",
      time: "07:30",
      name: "Café da manhã",
      items: [
        { food: "Leite de vaca desnatado", quantity: "100ml" },
        { food: "Farelo de aveia", quantity: "20g" },
        { food: "Cacau", quantity: "10g" },
        { food: "Whey Protein", quantity: "30g" }
      ],
      completed: false
    },
    {
      id: "colacao",
      time: "10:00",
      name: "Colação",
      items: [
        { food: "Fruta", quantity: "1 porção" }
      ],
      obs: "1 porção de fruta = 10 unidades de uva OU 1 kiwi OU 2 fatias finas de melão (240g) OU 1 fatia grossa de mamão formosa (200g) OU ½ mamão papaia OU 2 rodelas finas de abacaxi (180g) OU 1 maçã pequena OU 1 pêra pequena OU 1 mexerica OU 1 laranja OU 1 fatia grossa de melancia (200g) OU 1 pedaço médio de manga (100g)",
      completed: false
    },
    {
      id: "almoco",
      time: "12:30",
      name: "Almoço",
      items: [
        { food: "Pão integral", quantity: "2 fatias" },
        { food: "Ovos", quantity: "2 unidades", alternatives: ["2 fatias de queijo minas", "3 colheres de sopa de frango desfiado"] },
        { food: "Requeijão light", quantity: "1 colher de sopa", alternatives: ["creme de ricota"] },
        { food: "Alface", quantity: "1 folha" },
        { food: "Tomate", quantity: "3 fatias médias" }
      ],
      obs: "Sanduiche natural",
      completed: false
    },
    {
      id: "lanche-tarde",
      time: "16:30",
      name: "Lanche da tarde / Pós treino",
      items: [
        { food: "Ovo de galinha", quantity: "2 unidades" },
        { food: "Farelo de aveia", quantity: "15g" },
        { food: "Banana", quantity: "1 unidade", alternatives: ["ouro", "prata", "d'água", "da terra"] },
        { food: "Canela em pó", quantity: "1 colher de café (1,2g)" },
        { food: "Café", quantity: "1 xícara" }
      ],
      obs: "Panqueca de banana",
      completed: false
    },
    {
      id: "jantar",
      time: "20:30",
      name: "Jantar",
      items: [
        { food: "Arroz", quantity: "90g" },
        { food: "Feijão", quantity: "60g", alternatives: ["lentilha", "grão de bico"] },
        { food: "Carne bovina", quantity: "100g", alternatives: ["Frango"] },
        { food: "Legumes cozidos", quantity: "80g" },
        { food: "Salada ou verdura crua", quantity: "à vontade" }
      ],
      obs: "Proteína: 100 g de carne magra -> frango grelhado OU frango desfiado OU frango xadrez OU peixe grelhado, cozido ou assado OU lombo suíno OU carne moída OU carne bovina OU carne em cubos OU 2 ovos OU omelete de 2 ovos com tomate, cebola, cebolinha, salsinha, sal e temperos naturais. Legumes e verduras: sempre variar as opções ao máximo, e escolher, no mínimo, 3 opções de cores diferentes. Consumir até 3 colheres de sopa de cada opção. Se forem folhas cruas, consumir à vontade. Dica: Escolha, pelo menos, 1 tipo de folha, um legume cru e um cozido. Por exemplo: alface roxa, cenoura ralada e berinjela refogada.",
      completed: false
    }
  ],
  substitutions: [
    {
      name: "Substituição 1 (Café da manhã)",
      items: [
        { food: "Iogurte Batavo Tradicional", quantity: "150g" },
        { food: "Farelo de aveia", quantity: "20g" },
        { food: "Semente de chia", quantity: "10g" },
        { food: "Fruta", quantity: "100g" },
        { food: "Whey Protein", quantity: "30g" }
      ],
      obs: "Overnight"
    },
    {
      name: "Substituição 1 (Lanche da tarde)",
      items: [
        { food: "Ovo de galinha", quantity: "2 unidades" },
        { food: "Tapioca de goma", quantity: "1 colher de sopa (15g)" },
        { food: "Mussarela", quantity: "1 fatia", alternatives: ["1 colher de sopa rasa de requeijão light"] },
        { food: "Café", quantity: "1 xícara" }
      ],
      obs: "Crepioca: misture os ovos com a tapioca depois recheie"
    }
  ]
};

export const henriqueDefault: User = {
  username: 'henrique',
  name: 'Henrique',
  age: 26,
  sex: 'masculino',
  goal: 'Hipertrofia & Força',
  role: 'student',
  streak: 0,
  totalWorkouts: 0,
  history: [],
  weights: {},
  checkIns: [],
  badges: [],
  isProfileComplete: true,
  dietPlan: henriqueDietPlan,
  challenge90: {
    dataInicio: '2026-07-06',
    goal: { description: 'Chegar a 9% de percentual de gordura', type: 'percentual_gordura', targetValue: 9 },
    dailyChecks: [],
    measurements: [
      {
        date: '2026-07-06',
        peso: 68.0,
        percentualGordura: 13.0,
        peito: 93.0,
        cintura: 84.0,
        abdomen: 85.0,
        panturrilhaDireita: 37.0,
        panturrilhaEsquerda: 37.0,
        pernaDireita: 51.0,
        pernaEsquerda: 50.0,
        coxaDireita: 51.0,
        coxaEsquerda: 50.0,
        bracoRelaxadoDireito: 31.0,
        bracoRelaxadoEsquerdo: 31.0,
        bracoContraidoDireito: 35.0,
        bracoContraidoEsquerdo: 35.0,
        pregaTriceps: 11.0,
        pregaAxilarMedia: 11.0,
        pregaTorax: 5.0,
        pregaAbdominal: 23.0,
        pregaSuprailiaca: 13.0,
        pregaSubescapular: 18.0,
        pregaCoxa: 11.0,
        observacao: 'Avaliação inicial oficial'
      }
    ]
  },
  operacao9Data: {
    dataInicio: '2026-07-20',
    dataFim: '2026-10-18',
    pesoInicial: 68.9,
    gorduraInicial: 13.61,
    cinturaInicial: 84.0,
    abdomenInicial: 85.0,
    metaGordura: 9.0,
    checkIns: [
      {
        id: 'chk-w1',
        semana: 1,
        data: '2026-07-20',
        peso: 68.9,
        cintura: 84.0,
        abdomen: 85.0,
        treinosConcluidos: 5,
        gorduraCorporal: 13.61,
        fotoProgresso: true,
        observacoes: 'Início oficial da Operação 9%. Avaliação pela nutricionista. Aposta valendo com a esposa!'
      }
    ]
  },
  tasks: [
    {
      id: 'task-1',
      title: 'Cardio em jejum (moderado)',
      time: '07:30',
      category: 'Saúde',
      repeatDays: 'Ter, Qui, Sáb',
      completed: false,
      priority: true,
      icon: 'Flame',
      period: 'hoje'
    },
    {
      id: 'task-2',
      title: 'Café da manhã',
      time: '08:30',
      category: 'Dieta',
      repeatDays: 'Todos os dias',
      completed: false,
      priority: false,
      icon: 'Coffee',
      period: 'hoje'
    },
    {
      id: 'task-3',
      title: 'Lanche (pré-treino)',
      time: '11:00',
      category: 'Dieta',
      repeatDays: 'Todos os dias',
      completed: false,
      priority: false,
      icon: 'Apple',
      period: 'hoje'
    },
    {
      id: 'task-4',
      title: 'Treino de força',
      time: '11:30',
      category: 'Academia',
      repeatDays: 'Segunda a Sexta',
      completed: false,
      priority: true,
      icon: 'Dumbbell',
      period: 'hoje'
    },
    {
      id: 'task-5',
      title: 'Almoço (pós-treino)',
      time: '13:30',
      category: 'Dieta',
      repeatDays: 'Todos os dias',
      completed: false,
      priority: false,
      icon: 'Apple',
      period: 'hoje'
    },
    {
      id: 'task-6',
      title: 'Lanche',
      time: '17:30',
      category: 'Dieta',
      repeatDays: 'Todos os dias',
      completed: false,
      priority: false,
      icon: 'Apple',
      period: 'hoje'
    },
    {
      id: 'task-7',
      title: 'Jantar',
      time: '20:30',
      category: 'Dieta',
      repeatDays: 'Todos os dias',
      completed: false,
      priority: false,
      icon: 'Apple',
      period: 'hoje'
    }
  ]
};

export const jessicaDefault: User = {
  username: 'jessica',
  name: 'Jessica',
  age: 24,
  sex: 'feminino',
  goal: 'Glúteo & Posterior Premium',
  role: 'student',
  streak: 0,
  totalWorkouts: 0,
  history: [],
  weights: {},
  checkIns: [],
  badges: [],
  isProfileComplete: true,
  dietPlan: jessicaDietPlan,
  challenge90: {
    dataInicio: '2026-07-06',
    goal: { description: 'Perder 2kg por mês', type: 'peso_mensal', targetValue: 2 },
    dailyChecks: [],
    measurements: []
  }
};

export const professorDefault: User = {
  username: 'teste3',
  name: 'Professor',
  age: 35,
  sex: 'masculino',
  goal: 'Orientar alunos',
  role: 'teacher',
  streak: 0,
  totalWorkouts: 0,
  history: [],
  weights: {},
  checkIns: [],
  badges: [],
  isProfileComplete: true
};

const DEFAULT_PASSWORDS: Record<string, string> = {
  henrique: '12345',
  jessica: '9860',
  teste3: '12345'
};

export function getUserByUsername(username: string): User | null {
  const normalized = username.trim().toLowerCase();
  if (normalized === 'henrique') return { ...henriqueDefault };
  if (normalized === 'jessica') return { ...jessicaDefault };
  if (normalized === 'teste3') return { ...professorDefault };
  return null;
}

export function validateCredentials(username: string, password: string): boolean {
  const normalized = username.trim().toLowerCase();
  return DEFAULT_PASSWORDS[normalized] === password;
}
