export interface DietMeal {
  time: string;
  name: string;
  items: string[];
  tips?: string[];
  substitutions?: {
    name: string;
    items: string[];
    tips?: string[];
  }[];
}

export interface DietPlan {
  orientations: string[];
  meals: DietMeal[];
}

export const henriqueDiet: DietPlan = {
  orientations: [
    'Objetivo: Melhorar composição corporal',
    'Bater meta de água todos os dias (Seu peso x 35ml)',
    'Tentar introduzir caminhada até começar academia',
    'Liberado 1 a 2 refeições livres por semana',
    'Sem bebida alcóolica até começar academia'
  ],
  meals: [
    {
      time: '08:30',
      name: 'Café da manhã',
    items: [
      '2 fatias de pão integral ou 1 unidade de pão de sal',
      '2 ovos ou 60g de frango desfiado',
      'Requeijão light (Colher De Sopa: 1)',
      'Café (Xicara De Cafe: 1)',
      '1 unidade de banana ou maçã ou pera'
    ],
    tips: [
      'Pão + recheio proteíco + café sem açúcar',
      'Marcas de pão: wickbold, newbread ou delicias do trigo'
    ]
  },
  {
    time: '13:00',
    name: 'Almoço',
    items: [
      'Arroz (Grama: 130)',
      'Feijão (Grama: 70)',
      'Carne bovina ou Frango (Grama: 130)',
      '80g de legumes cozidos - ver opções da lista que você gosta',
      'Salada ou verdura crua a vontade'
    ],
    tips: [
      'Proteína: 110 g de carne magra -> frango grelhado OU frango desfiado OU frango xadrez OU peixe grelhado, cozido ou assado OU lombo suíno OU carne moída OU carne bovina OU carne em cubos OU 2 ovos OU omelete de 2 ovos com tomate, cebola, cebolinha, salsinha, sal e temperos naturais',
      'Legumes e verduras: sempre variar as opções ao máximo, e escolher, no mínimo, 3 opções de cores diferentes. Consumir até 3 colheres de sopa de cada opção. Se forem folhas cruas, consumir à vontade.',
      'Dica: Escolha, pelo menos, 1 tipo de folha, um legume cru e um cozido. Por exemplo: alface roxa, cenoura ralada e berinjela refogada.'
    ]
  },
  {
    time: '16:00',
    name: 'Lanche da tarde',
    items: [
      'Fruta (Porção: 1)',
      'Iogurte, natural (Copo: 1)',
      'Whey Protein (Grama: 40)',
      'Granola (Grama: 30)'
    ],
    tips: [
      'Bom iogurte natural contém de 2 a 3 ingredientes',
      '1 porção de fruta = 5 unidades de morango OU 10 unidades de uva OU 1 kiwi OU 1 unidade de banana OU 1 maçã pequena OU 1 pêra pequena OU 1 pêssego'
    ]
  },
  {
    time: '20:30',
    name: 'Jantar',
    items: [
      'Cuscuz de milho (Grama: 80)',
      'Frango desfiado ou carne (Grama: 100)',
      'Salada ou verdura crua (Meio Prato Cheio: 1)'
    ],
    tips: [
      'Cuscuz recheado'
    ],
    substitutions: [
      {
        name: 'Substituição 1',
        items: [
          'Rap10 fit ou integral (Unidade: 1)',
          '100g de frango desfiado ou carne ou 3 ovos',
          '1 colher de sopa rasa de requeijão light ou creme de ricota ou 1 fatia de mussarela',
          'Alface (Folha: 1)',
          'Tomate (Fatia média: 3)'
        ],
        tips: [
          'Rap 10 integral ou fit + recheio'
        ]
      },
      {
        name: 'Substituição 2',
        items: [
          'Omelete de 2 ovos',
          '80g de frango desfiado ou carne',
          'Muçarela (Fatia: 1)',
          'Salada ou verdura crua (Meio Prato Cheio: 1)'
        ],
        tips: [
          'Omelete recheado + salada'
        ]
      }
    ]
  }
  ]
};

export const jessicaDiet: DietPlan = {
  orientations: [
    'Objetivo: Emagrecimento (Meta inicial: 78kg)',
    'Bater meta de água todos os dias',
    'Atividade física no mínimo 4x na semana',
    'Liberado 1 a 2 refeições livres por semana'
  ],
  meals: [
  {
    time: '07:30',
    name: 'Café da manhã',
    items: [
      'Leite de vaca desnatado (Mililitro: 100)',
      'Farelo de aveia (Grama: 20)',
      'Cacau (Grama: 10)',
      'Whey Protein (Grama: 30)'
    ],
    substitutions: [
      {
        name: 'Substituição 1 (Overnight)',
        items: [
          'Iogurte Batavo Tradicional (Grama: 150)',
          'Farelo de aveia (Grama: 20)',
          'Semente de chia (Grama: 10)',
          '100g de fruta',
          'Whey Protein (Grama: 30)'
        ],
        tips: [
          'Overnight'
        ]
      }
    ]
  },
  {
    time: '10:00',
    name: 'Colação',
    items: [
      'Fruta (Porção: 1)'
    ],
    tips: [
      '1 porção de fruta = 10 unidades de uva OU 1 kiwi OU 2 fatias finas de melão (240g) OU 1 fatia grossa de mamão formosa (200g) OU ½ mamão papaia OU 2 rodelas finas de abacaxi (180g) OU 1 maçã pequena OU 1 pêra pequena OU 1 mexerica OU 1 laranja OU 1 fatia grossa de melancia (200g) OU 1 pedaço médio de manga (100g)'
    ]
  },
  {
    time: '12:30',
    name: 'Almoço',
    items: [
      'Pão integral (Fatia: 2)',
      '2 ovos OU 2 fatias de queijo minas OU 3 colheres de sopa de frango desfiado',
      'Requeijão light OU creme de ricota (Colher De Sopa: 1)',
      'Alface (Folha: 1)',
      'Tomate (Fatia média: 3)'
    ],
    tips: [
      'Sanduiche natural'
    ]
  },
  {
    time: '16:30',
    name: 'Lanche da tarde/Pós treino',
    items: [
      'Ovo de galinha (Unidade: 2)',
      'Farelo de aveia (Grama: 15)',
      'Banana (ouro, prata, d´água, da terra, etc.) (Unidade: 1)',
      'Canela em pó (Colher de café (1,2g): 1)',
      'Café (Xicara De Cafe: 1)'
    ],
    tips: [
      'Panqueca de banana'
    ],
    substitutions: [
      {
        name: 'Substituição 1 (Crepioca)',
        items: [
          'Ovo de galinha (Unidade: 2)',
          'Tapioca de goma (colher de sopa (15g): 1)',
          '1 fatia de mussarela ou 1 colher de sopa rasa de requeijão light',
          'Café (Xicara De Cafe: 1)'
        ],
        tips: [
          'Crepioca: misture os ovos com a tapioca depois recheie'
        ]
      }
    ]
  },
  {
    time: '20:30',
    name: 'Jantar',
    items: [
      'Arroz (Grama: 90)',
      'Feijão OU lentilha OU grão de bico (Grama: 60)',
      'Carne bovina OU Frango (Grama: 100)',
      'Legumes cozidos (Grama: 80)',
      'Salada OU verdura crua a vontade'
    ],
    tips: [
      'Proteína: 100 g de carne magra -> frango grelhado OU frango desfiado OU frango xadrez OU peixe grelhado, cozido ou assado OU lombo suíno OU carne moída OU carne bovina OU carne em cubos OU 2 ovos OU omelete de 2 ovos com tomate, cebola, cebolinha, salsinha, sal e temperos naturais',
      'Legumes e verduras: sempre variar as opções ao máximo, e escolher, no mínimo, 3 opções de cores diferentes. Consumir até 3 colheres de sopa de cada opção. Se forem folhas cruas, consumir à vontade. Dica: Escolha, pelo menos, 1 tipo de folha, um legume cru e um cozido. Por exemplo: alface roxa, cenoura ralada e berinjela refogada.'
    ]
  }
  ]
};

