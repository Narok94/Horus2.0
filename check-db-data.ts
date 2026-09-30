import pg from "pg";

const { Pool } = pg;
let databaseUrl = process.env.DATABASE_URL;

if (databaseUrl) {
  databaseUrl = databaseUrl.trim();
  if (databaseUrl.startsWith('=')) {
    databaseUrl = databaseUrl.substring(1).trim();
  }
  if (databaseUrl.startsWith('"') && databaseUrl.endsWith('"')) {
    databaseUrl = databaseUrl.slice(1, -1).trim();
  } else if (databaseUrl.startsWith("'") && databaseUrl.endsWith("'")) {
    databaseUrl = databaseUrl.slice(1, -1).trim();
  }
}

async function checkData() {
  if (!databaseUrl) {
    console.error("No DATABASE_URL found");
    return;
  }
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });
  try {
    const res = await pool.query("SELECT * FROM user_profiles");
    console.log(`Found ${res.rows.length} rows:`);
    res.rows.forEach(row => {
      console.log(`- Username: ${row.username}`);
      console.log(`  Data:`, JSON.stringify(row.profile_data));
      console.log(`  Updated At: ${row.updated_at}`);
    });
  } catch (err: any) {
    console.error("Error checking data:", err.message);
  } finally {
    await pool.end();
  }
}

checkData();
