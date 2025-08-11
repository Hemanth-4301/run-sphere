const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 30

const buckets = new Map()

function rateLimiter(req, res, next) {
  const ip = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress || "unknown"
  const now = Date.now()
  if (!buckets.has(ip)) {
    buckets.set(ip, [])
  }
  const arr = buckets.get(ip)

  // Remove timestamps outside the window
  while (arr.length && now - arr[0] > WINDOW_MS) arr.shift()

  if (arr.length >= MAX_REQUESTS) {
    return res.status(429).json({
      error: "Too Many Requests",
      message: "Rate limit exceeded. Please wait a minute and try again.",
    })
  }
  arr.push(now)
  next()
}

module.exports = rateLimiter
