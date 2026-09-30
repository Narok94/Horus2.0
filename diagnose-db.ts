import pg from "pg";

const { Pool } = pg;
const originalUrl = process.env.DATABASE_URL;

console.log("=========================================");
console.log("   DIAGNÓSTICO DE CONEXÃO NEON POSTGRES  ");
console.log("=========================================\n");

if (!originalUrl) {
  console.error("❌ ERRO: A variável de ambiente DATABASE_URL não está definida!");
  console.log("\n💡 Dica: Certifique-se de definir DATABASE_URL no seu painel de controle (Vercel, Railway, Render ou arquivo .env local).");
  process.exit(1);
}

const cleanedUrl = originalUrl.trim();
console.log(`- Comprimento da string original: ${originalUrl.length} caracteres`);

let issuesFound = false;
let hasLeadingEqual = false;
let hasQuotes = false;
let wrongPrefix = false;

if (cleanedUrl.startsWith('=')) {
  hasLeadingEqual = true;
  issuesFound = true;
  console.log("⚠️  ALERTA: Sua string de conexão começa com o caractere '=' !");
  console.log("   Isso geralmente acontece quando você copia 'DATABASE_URL=postgres://...' inteiro para o valor da variável.");
}

if ((cleanedUrl.startsWith('"') && cleanedUrl.endsWith('"')) || (cleanedUrl.startsWith("'") && cleanedUrl.endsWith("'"))) {
  hasQuotes = true;
  issuesFound = true;
  console.log("⚠️  ALERTA: Sua string de conexão está envolvida em aspas simples ou duplas!");
}

// Limpeza da URL para teste
let targetUrl = cleanedUrl;
if (targetUrl.startsWith('=')) {
  targetUrl = targetUrl.substring(1).trim();
}
if (targetUrl.startsWith('"') && targetUrl.endsWith('"')) {
  targetUrl = targetUrl.slice(1, -1).trim();
} else if (targetUrl.startsWith("'") && targetUrl.endsWith("'")) {
  targetUrl = targetUrl.slice(1, -1).trim();
}

const validProtocol = targetUrl.startsWith("postgresql://") || targetUrl.startsWith("postgres://");
if (!validProtocol) {
  wrongPrefix = true;
  issuesFound = true;
  console.log(`❌ ERRO: O protocolo da string é inválido. Ele deve começar com "postgresql://" ou "postgres://".`);
  console.log(`   Início atual da sua string: "${targetUrl.substring(0, 20)}..."`);
} else {
  console.log(`✅ O protocolo de conexão começa corretamente com postgresql:// ou postgres://`);
}

if (!issuesFound) {
  console.log("✅ Nenhuma falha óbvia de formatação foi encontrada na string!");
} else {
  console.log("\n📋 RECOMENDAÇÃO DE AJUSTE:");
  if (hasLeadingEqual) {
    console.log("   👉 Edite sua variável DATABASE_URL e remova o caractere '=' do início.");
  }
  if (hasQuotes) {
    console.log("   👉 Remova as aspas no início e fim do valor da variável DATABASE_URL.");
  }
  if (wrongPrefix) {
    console.log("   👉 Certifique-se de que a URL comece diretamente com 'postgresql://' ou 'postgres://'.");
  }
}

console.log("\n-----------------------------------------");
console.log("Tentando conexão real com o banco de dados...");
console.log("-----------------------------------------");

const pool = new Pool({
  connectionString: targetUrl,
  ssl: { rejectUnauthorized: false }
});

async function runTest() {
  const start = Date.now();
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("🎉 CONEXÃO REALIZADA COM SUCESSO!");
    console.log(`- Tempo de resposta: ${Date.now() - start}ms`);
    console.log(`- Hora do servidor no banco: ${res.rows[0].now}`);
    
    // Testar se a tabela user_profiles existe
    try {
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'user_profiles'
        );
      `);
      const tableExists = tableCheck.rows[0].exists;
      if (tableExists) {
        console.log("✅ Tabela 'user_profiles' existe e está pronta!");
        const countRes = await pool.query("SELECT COUNT(*) FROM user_profiles");
        console.log(`- Quantidade de perfis sincronizados: ${countRes.rows[0].count}`);
      } else {
        console.log("⚠️  AVISO: A tabela 'user_profiles' não foi encontrada. O servidor irá criá-la automaticamente na inicialização.");
      }
    } catch (tableErr: any) {
      console.log(`⚠️  Erro ao verificar a tabela: ${tableErr.message}`);
    }
  } catch (err: any) {
    console.error("❌ FALHA NA CONEXÃO REAL COM O BANCO DE DADOS:");
    console.error(`- Detalhe do Erro: ${err.message}`);
    console.log("\n💡 Sugestões adicionais:");
    console.log("1. Verifique se o host e as credenciais (usuário/senha) estão corretos no painel da Neon.");
    console.log("2. Verifique se adicionou '?sslmode=require' no final da string.");
    console.log("3. Certifique-se de que o projeto na Neon não está pausado.");
  } finally {
    await pool.end();
    console.log("\n=========================================");
  }
}

runTest();
