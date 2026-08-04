const buckets = new Map();

function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  return (forwardedFor?.split(",")[0] || realIp || "unknown").trim();
}

function prune(now) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function checkRateLimit(request, options) {
  const now = Date.now();
  const windowMs = Number(options.windowMs || 60000);
  const max = Number(options.max || 20);
  const key = `${options.name}:${getClientIp(request)}`;

  prune(now);

  const bucket = buckets.get(key) || {
    count: 0,
    resetAt: now + windowMs
  };

  if (bucket.resetAt <= now) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

  return {
    allowed: bucket.count <= max,
    retryAfterSeconds,
    remaining: Math.max(0, max - bucket.count)
  };
}

export function rateLimitedJson(limit) {
  return Response.json(
    {
      status: "error",
      message: "Too many requests. Please wait a moment and try again."
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(limit.retryAfterSeconds)
      }
    }
  );
}
