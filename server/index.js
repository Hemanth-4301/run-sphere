const express = require("express");
const cors = require("cors");
const rateLimiter = require("./middleware/rateLimiter");
const { runCode } = require("./geminiClient");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

// Config
const ALLOWED_LANGUAGES = [
  "java",
  "csharp",
  "python",
  "c",
  "cpp",
  "javascript",
];
const MAX_TIMEOUT_MS = 30000;
const DEFAULT_TIMEOUT_MS = 10000;

// In-memory results store
const runs = new Map(); // id => result

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://run-sphere.vercel.app"],
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(rateLimiter);

// Simple logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const took = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${
        res.statusCode
      } (${took}ms)`
    );
  });
  next();
});

app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.post("/api/run", async (req, res) => {
  const { language, code, stdin = "", timeoutMs } = req.body || {};
  if (!code || typeof code !== "string" || !code.trim()) {
    return res.status(400).json({
      error: "Invalid input",
      message: "Code must be a non-empty string.",
    });
  }
  if (!ALLOWED_LANGUAGES.includes(language)) {
    return res.status(400).json({
      error: "Invalid language",
      message: `Language must be one of: ${ALLOWED_LANGUAGES.join(", ")}`,
    });
  }
  const t =
    typeof timeoutMs === "number"
      ? Math.max(1000, Math.min(timeoutMs, MAX_TIMEOUT_MS))
      : DEFAULT_TIMEOUT_MS;

  // Log request summary (avoid logging full code)
  console.log(
    `Run request: language=${language}, codeLength=${
      code.length
    }, stdinLength=${(stdin || "").length}, timeoutMs=${t}`
  );

  const id = cryptoRandomId();
  // Call Gemini
  const result = await runCode({ language, code, stdin, timeoutMs: t });

  // Store result
  const stored = {
    id,
    status: result.status,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    exitCode: result.exitCode ?? null,
    durationMs: result.durationMs ?? null,
    logs: result.logs || [],
    createdAt: new Date().toISOString(),
  };
  runs.set(id, stored);

  // Clean up old entries occasionally
  if (runs.size > 1000) {
    pruneRuns();
  }

  // Return immediate result
  if (result.status === "timeout") {
    return res.status(200).json({ id, ...stored });
  } else if (result.status === "error") {
    return res.status(200).json({ id, ...stored });
  } else {
    return res.status(200).json({ id, ...stored });
  }
});

app.get("/api/result/:id", (req, res) => {
  const { id } = req.params;
  const data = runs.get(id);
  if (!data) {
    return res
      .status(404)
      .json({ error: "Not Found", message: "Invalid run id" });
  }
  return res.json(data);
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "ServerError",
    message: "An unexpected error occurred.",
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2) + Date.now();
}

function pruneRuns() {
  // Keep the most recent 500
  const arr = Array.from(runs.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  runs.clear();
  for (const r of arr.slice(0, 500)) runs.set(r.id, r);
}
