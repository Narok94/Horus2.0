import express from "express";
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

export let pool: pg.Pool | null = null;

if (databaseUrl) {
  console.log('[Neon DB] Connecting to Neon database...');
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  // Auto-initialize the table
  pool.query(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      username VARCHAR(100) PRIMARY KEY,
      profile_data JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).then(() => {
    console.log('[Neon DB] "user_profiles" table is verified and ready.');
  }).catch((err) => {
    console.error('[Neon DB] Error initializing table:', err);
  });
} else {
  console.warn('[Neon DB] DATABASE_URL environment variable is missing.');
}

export const apiRouter = express.Router();

apiRouter.use(express.json({ limit: '15mb' }));

// Health and DB status check endpoint
apiRouter.get("/health", async (req, res) => {
  try {
    if (!pool) {
      return res.json({ status: "error", message: "Database pool not initialized. DATABASE_URL might be missing." });
    }
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", time: result.rows[0].now, message: "Connected to Neon PostgreSQL" });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Comprehensive diagnosis endpoint
apiRouter.get("/diagnose", async (req, res) => {
  const originalUrl = process.env.DATABASE_URL;
  if (!originalUrl) {
    return res.json({ ok: false, error: "DATABASE_URL_NOT_DEFINED" });
  }

  const trimmedUrl = originalUrl.trim();
  const suggestions: string[] = [];
  let isOk = true;

  const hasLeadingEqual = trimmedUrl.startsWith('=');
  const hasQuotes = (trimmedUrl.startsWith('"') && trimmedUrl.endsWith('"')) || (trimmedUrl.startsWith("'") && trimmedUrl.endsWith("'"));
  
  let targetUrl = trimmedUrl;
  if (hasLeadingEqual) targetUrl = targetUrl.substring(1).trim();
  if (hasQuotes) targetUrl = targetUrl.slice(1, -1).trim();

  const hasCorrectProtocol = targetUrl.startsWith("postgresql://") || targetUrl.startsWith("postgres://");

  if (hasLeadingEqual) {
    isOk = false;
    suggestions.push("Remova o caractere '=' do início da variável DATABASE_URL.");
  }
  if (hasQuotes) {
    isOk = false;
    suggestions.push("Remova as aspas simples ou duplas ao redor do valor de DATABASE_URL.");
  }
  if (!hasCorrectProtocol) {
    isOk = false;
    suggestions.push("Certifique-se de que a string comece diretamente com 'postgresql://' ou 'postgres://'.");
  }

  let liveConnectionSuccess = false;
  let liveConnectionError = null;
  let responseTimeMs = null;
  let databaseTime = null;

  try {
    const testPool = new pg.Pool({
      connectionString: targetUrl,
      ssl: { rejectUnauthorized: false }
    });
    const start = Date.now();
    const testRes = await testPool.query("SELECT NOW()");
    responseTimeMs = Date.now() - start;
    databaseTime = testRes.rows[0].now;
    liveConnectionSuccess = true;
    await testPool.end();
  } catch (err: any) {
    liveConnectionError = err.message;
    isOk = false;
  }

  return res.json({
    ok: isOk,
    details: {
      length: originalUrl.length,
      hasLeadingEqual,
      hasQuotes,
      hasCorrectProtocol,
      liveConnectionSuccess,
      liveConnectionError,
      responseTimeMs,
      databaseTime
    },
    message_pt: isOk ? "Tudo pronto!" : "Foram encontrados problemas na configuração.",
    suggestions
  });
});

// Get User Profile
apiRouter.get("/user/:username", async (req, res) => {
  const username = req.params.username.trim().toLowerCase();
  if (!pool) return res.json({ status: "fallback", data: null, message: "No database connection" });
  
  try {
    const result = await pool.query("SELECT profile_data FROM user_profiles WHERE username = $1", [username]);
    if (result.rows.length > 0) {
      return res.json({ status: "ok", data: result.rows[0].profile_data });
    } else {
      return res.json({ status: "not_found", data: null });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Save or Update User Profile
apiRouter.post("/user/:username", async (req, res) => {
  const username = req.params.username.trim().toLowerCase();
  const profileData = req.body;
  
  if (!pool) return res.json({ status: "fallback", message: "No database connection" });
  
  try {
    await pool.query(
      `INSERT INTO user_profiles (username, profile_data, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (username)
       DO UPDATE SET profile_data = EXCLUDED.profile_data, updated_at = CURRENT_TIMESTAMP`,
      [username, profileData]
    );
    return res.json({ status: "ok" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Delete User Profile
apiRouter.delete("/user/:username", async (req, res) => {
  const username = req.params.username.trim().toLowerCase();
  if (!pool) return res.json({ status: "fallback", message: "No database connection" });
  
  try {
    await pool.query("DELETE FROM user_profiles WHERE username = $1", [username]);
    return res.json({ status: "ok" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Sync/Merge User Profile
apiRouter.post("/sync/:username", async (req, res) => {
  const username = req.params.username.trim().toLowerCase();
  const clientProfile = req.body;
  
  if (!pool) return res.json({ status: "fallback", data: clientProfile, message: "No database connection" });
  
  try {
    const result = await pool.query("SELECT profile_data FROM user_profiles WHERE username = $1", [username]);
    
    if (result.rows.length === 0) {
      await pool.query(
        "INSERT INTO user_profiles (username, profile_data, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)",
        [username, clientProfile]
      );
      return res.json({ status: "ok", data: clientProfile, source: "client_migrated" });
    }
    
    const dbProfile = result.rows[0].profile_data;
    
    const mergedCheckIns = Array.from(new Set([
      ...(dbProfile.checkIns || []),
      ...(clientProfile.checkIns || [])
    ]));
    
    const historyMap = new Map();
    (dbProfile.history || []).forEach((h: any) => { if (h && h.id) historyMap.set(h.id, h); });
    (clientProfile.history || []).forEach((h: any) => { if (h && h.id) historyMap.set(h.id, h); });
    const mergedHistory = Array.from(historyMap.values());
    mergedHistory.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const mergedWeights = { ...(dbProfile.weights || {}), ...(clientProfile.weights || {}) };
    
    // Merge completedMeals properly
    const dbCompleted = dbProfile.completedMeals || {};
    const clientCompleted = clientProfile.completedMeals || {};
    const mergedCompletedMeals: Record<string, string[]> = { ...dbCompleted };
    
    Object.keys(clientCompleted).forEach(date => {
      const dbMeals = new Set(mergedCompletedMeals[date] || []);
      clientCompleted[date].forEach((m: string) => dbMeals.add(m));
      mergedCompletedMeals[date] = Array.from(dbMeals);
    });
    
    const dbBadgeIds = new Set((dbProfile.badges || []).map((b: any) => b.id));
    const mergedBadges = [...(dbProfile.badges || [])];
    (clientProfile.badges || []).forEach((b: any) => {
      if (b && b.id && !dbBadgeIds.has(b.id)) {
        mergedBadges.push(b);
        dbBadgeIds.add(b.id);
      }
    });

    // Merge challenge90 properly
    const dbChallenge = dbProfile.challenge90 || {};
    const clientChallenge = clientProfile.challenge90 || {};
    const mergedChallenge = {
      ...clientChallenge,
      ...dbChallenge,
      goal: clientChallenge.goal || dbChallenge.goal,
      dataInicio: clientChallenge.dataInicio || dbChallenge.dataInicio || "2026-07-06"
    };

    const checksMap = new Map();
    (dbChallenge.dailyChecks || []).forEach((c: any) => { if (c && c.date) checksMap.set(c.date, c); });
    (clientChallenge.dailyChecks || []).forEach((c: any) => { if (c && c.date) checksMap.set(c.date, c); });
    mergedChallenge.dailyChecks = Array.from(checksMap.values()).sort((a: any, b: any) => a.date.localeCompare(b.date));

    const measurementsMap = new Map();
    (dbChallenge.measurements || []).forEach((m: any) => { if (m && m.date) measurementsMap.set(m.date, m); });
    (clientChallenge.measurements || []).forEach((m: any) => { if (m && m.date) measurementsMap.set(m.date, m); });
    mergedChallenge.measurements = Array.from(measurementsMap.values()).sort((a: any, b: any) => a.date.localeCompare(b.date));
    
    const mergedProfile = {
      ...clientProfile,
      ...dbProfile,
      checkIns: mergedCheckIns,
      history: mergedHistory,
      weights: mergedWeights,
      badges: mergedBadges,
      completedMeals: mergedCompletedMeals,
      dietPlan: clientProfile.dietPlan || dbProfile.dietPlan,
      tasks: clientProfile.tasks || dbProfile.tasks || [],
      challenge90: mergedChallenge,
      totalWorkouts: Math.max(dbProfile.totalWorkouts || 0, clientProfile.totalWorkouts || 0, mergedHistory.length),
      streak: Math.max(dbProfile.streak || 0, clientProfile.streak || 0)
    };
    
    await pool.query(
      "UPDATE user_profiles SET profile_data = $1, updated_at = CURRENT_TIMESTAMP WHERE username = $2",
      [mergedProfile, username]
    );
    
    return res.json({ status: "ok", data: mergedProfile, source: "merged" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
