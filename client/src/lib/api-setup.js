// src/lib/api.js
const headers = {
  "Content-Type": "application/json",
};

const BASE_URL = "https://run-sphere-api.onrender.com";

export async function runCode({ language, code, stdin, timeoutMs }) {
  const resp = await fetch(`${BASE_URL}/api/run`, {
    method: "POST",
    headers,
    body: JSON.stringify({ language, code, stdin, timeoutMs }),
  });
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.message || "Failed to run code");
  }
  return data;
}

export async function getResult(id) {
  const resp = await fetch(`${BASE_URL}/api/result/${encodeURIComponent(id)}`);
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.message || "Failed to get result");
  }
  return data;
}
