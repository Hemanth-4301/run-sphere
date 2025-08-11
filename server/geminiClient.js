const { GEMINI_API_KEY } = require("./config");

// Helpers
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function sanitizeOutput(str, maxLen = 200000) {
  if (typeof str !== "string") str = String(str ?? "");
  const truncated = str.length > maxLen;
  return {
    text: truncated ? str.slice(0, maxLen) + "\n[truncated]" : str,
    truncated,
  };
}

function extractJsonString(text) {
  if (!text) return null;
  // Remove code fences if present
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  // Try to find the first JSON object substring using brace matching
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }
  return null;
}

async function callGeminiOnce({ language, code, stdin, timeoutMs }) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
    encodeURIComponent(GEMINI_API_KEY);

  const instruction =
    `You are a secure code runner. You run code in an isolated sandbox with compilers and interpreters for these languages: C, C++, C#, Java, Python, JavaScript.\n` +
    `You will be given JSON input with fields: language, code, stdin. You must execute the code exactly as provided.\n` +
    `Rules:\n` +
    `- Use the 'stdin' string as standard input for the program.\n` +
    `- Capture the exact standard output and standard error.\n` +
    `- If compilation or runtime fails, put messages in "stderr" and set a non-zero "exitCode". Do not treat it as a system error.\n` +
    `- Measure duration in milliseconds (durationMs) for execution.\n` +
    `- Provide an optional "logs" array (e.g., compilation steps or notes). Keep it brief.\n` +
    `- Respond ONLY with strict JSON. Do NOT include any extra text or code fences.\n` +
    `JSON shape:\n` +
    `{\n` +
    `  "stdout": "<program standard output as a single string>",\n` +
    `  "stderr": "<program standard error as a single string>",\n` +
    `  "exitCode": 0,\n` +
    `  "durationMs": 120,\n` +
    `  "logs": ["compilation step log lines..."],\n` +
    `  "error": null\n` +
    `}\n` +
    `If you cannot actually execute code, you MUST still respond in the exact JSON shape, simulating the result based on the code and stdin.`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text:
              instruction +
              "\n\nInput JSON:\n" +
              JSON.stringify({ language, code, stdin }),
          },
        ],
      },
    ],
  };

  const started = Date.now();
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const text = await resp.text();
    clearTimeout(id);

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }

    // Extract the model text answer from candidates
    let modelText = "";
    if (json && json.candidates && json.candidates.length > 0) {
      const parts = json.candidates[0]?.content?.parts || [];
      modelText = parts.map((p) => p.text || "").join("\n");
    } else if (!resp.ok) {
      return {
        status: "error",
        stdout: "",
        stderr:
          "Gemini API error: " +
          resp.status +
          " " +
          resp.statusText +
          (text ? " - " + text.slice(0, 1000) : ""),
        exitCode: null,
        durationMs: Date.now() - started,
        logs: [],
        raw: text,
      };
    }

    // Parse strict JSON from modelText
    let parsed;
    if (modelText) {
      const jsonStr = extractJsonString(modelText) || modelText;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (e) {
        return {
          status: "error",
          stdout: "",
          stderr:
            "Failed to parse JSON from Gemini response. Ensure the model returns strict JSON. Error: " +
            e.message,
          exitCode: null,
          durationMs: Date.now() - started,
          logs: [modelText.slice(0, 500)],
          raw: modelText,
        };
      }
    } else {
      return {
        status: "error",
        stdout: "",
        stderr: "Empty response from Gemini.",
        exitCode: null,
        durationMs: Date.now() - started,
        logs: [],
        raw: text,
      };
    }

    // Normalize fields
    const stdout =
      typeof parsed.stdout === "string"
        ? parsed.stdout
        : String(parsed.stdout ?? "");
    const stderr =
      typeof parsed.stderr === "string"
        ? parsed.stderr
        : String(parsed.stderr ?? "");
    const exitCode =
      typeof parsed.exitCode === "number"
        ? parsed.exitCode
        : parsed.error || stderr
        ? 1
        : 0;
    const durationMs =
      typeof parsed.durationMs === "number"
        ? parsed.durationMs
        : Date.now() - started;
    const logs = Array.isArray(parsed.logs) ? parsed.logs.slice(0, 100) : [];

    const sOut = sanitizeOutput(stdout);
    const sErr = sanitizeOutput(stderr);

    if (sOut.truncated || sErr.truncated) {
      logs.push("Output truncated to 200k characters.");
    }

    return {
      status: "success",
      stdout: sOut.text,
      stderr: sErr.text,
      exitCode,
      durationMs,
      logs,
      raw: parsed,
    };
  } catch (e) {
    clearTimeout(id);
    if (e.name === "AbortError") {
      return {
        status: "timeout",
        stdout: "",
        stderr: "Execution timed out.",
        exitCode: null,
        durationMs: Date.now() - started,
        logs: [],
        raw: null,
      };
    }
    return {
      status: "error",
      stdout: "",
      stderr: "Network error calling Gemini: " + e.message,
      exitCode: null,
      durationMs: Date.now() - started,
      logs: [],
      raw: null,
    };
  }
}

async function runCode({ language, code, stdin = "", timeoutMs = 10000 }) {
  const attempt1 = await callGeminiOnce({ language, code, stdin, timeoutMs });
  // Retry on transient errors
  const transient =
    attempt1.status === "error" &&
    /429|rate limit|temporarily|unavailable|timeout|Network error/i.test(
      attempt1.stderr || ""
    );
  if (transient) {
    await sleep(300);
    const attempt2 = await callGeminiOnce({ language, code, stdin, timeoutMs });
    return attempt2;
  }
  return attempt1;
}

module.exports = { runCode };
