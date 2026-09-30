# Horus — publicação e verificação mobile

## Vercel

Importar o repositório do GitHub, escolher a raiz e iniciar o deploy.
`vercel.json` configura Vite, instalação com npm, `npm run build`, saída
`dist` e rewrite para `index.html`. Node 22.x está declarado em package.json.
Nenhuma variável de ambiente ou credencial de serviço é necessária.

O login é uma demonstração local: `henrique` / `12345`. Essa credencial é
pública e não constitui proteção de dados no servidor. Todos os registros
permanecem no localStorage do navegador e da origem utilizada. Dados de
localhost não são transferidos automaticamente para o domínio publicado.

O package-lock mantém os registros de versões existentes; suas dependências
diretas foram alinhadas ao package.json. Não houve regeneração completa com
npm neste ambiente. `npm install` no build resolve/poda registros excedentes.

## PWA / iOS

Manifest standalone, theme-color escuro e apple-touch-icon explícito.
Os ícones PNG têm dimensões reais 192, 512 e 180 px. O símbolo vetorial
provisório de Horus substitui os arquivos corrompidos, conforme autorização.
Não existe service worker: não há promessa de uso offline.

No iPhone, abrir a URL HTTPS no Safari e escolher Compartilhar → Adicionar
à Tela de Início. Reinstalar o atalho antigo se o iOS mantiver seu ícone em cache.

## Verificação

Viewports de referência: iPhone 11 414×896; iPhone 16 393×852 CSS px.
Conferidos HOME, TREINOS, ficha, modal, HISTÓRICO (estado vazio) e PERFIL.
CSS usa as quatro safe areas, altura dinâmica e espaço sob a navegação.
As verificações em Chrome não emulam o Safari/WebKit nem o notch real.
Validar nos aparelhos o modo standalone, teclado e rotação antes de uso diário.

TypeScript e build Vite devem passar antes da publicação. O bundle atual
gera aviso de tamanho acima de 500 kB, sem impedir o build.
