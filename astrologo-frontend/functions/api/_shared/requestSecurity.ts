export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  "Cross-Origin-Resource-Policy": "same-site"
} as const;

export interface D1Statement<TFirst = unknown> {
  bind: (...args: unknown[]) => D1Statement<TFirst>;
  first: () => Promise<TFirst | null>;
  run: () => Promise<unknown>;
  all: () => Promise<{ results: TFirst[] }>;
}

export interface D1DatabaseLike {
  prepare: <TFirst = unknown>(query: string) => D1Statement<TFirst>;
}

export interface RateLimitConfig {
  route: string;
  limit: number;
  windowMs: number;
}

export interface EffectiveRateLimitConfig extends RateLimitConfig {
  enabled: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

interface RateLimitRow {
  request_count: number;
  window_start: number;
}

interface RateLimitPolicyRow {
  enabled: number;
  max_requests: number;
  window_minutes: number;
}

export const isAllowedLcvOrigin = (origin: string): boolean => /^https:\/\/([a-z0-9-]+\.)*lcv\.app\.br$/i.test(origin);

export const getCorsHeaders = (
  request: Request,
  fallbackOrigin: string,
  methods = "POST, OPTIONS"
): Record<string, string> => {
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = isAllowedLcvOrigin(origin) ? origin : fallbackOrigin;

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type"
  };
};

export const hasDisallowedOrigin = (request: Request): boolean => {
  const origin = request.headers.get("Origin");
  return !!origin && !isAllowedLcvOrigin(origin);
};

export const getClientIp = (request: Request): string => {
  const cfIp = request.headers.get("CF-Connecting-IP")?.trim();
  if (cfIp) return cfIp;

  const forwarded = request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;

  return "unknown";
};

export const rateLimitHeaders = (result: RateLimitResult): Record<string, string> => {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000))
  };

  if (typeof result.retryAfter === "number") {
    headers["Retry-After"] = String(result.retryAfter);
  }

  return headers;
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

export const sha256Hex = async (value: string): Promise<string> => {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return toHex(digest);
};

export const enforceRateLimit = async (
  db: D1DatabaseLike,
  request: Request,
  config: RateLimitConfig
): Promise<RateLimitResult> => {
  const now = Date.now();
  const windowStart = now - (now % config.windowMs);
  const resetAt = windowStart + config.windowMs;
  const ip = getClientIp(request);
  const userAgent = request.headers.get("User-Agent") || "unknown";
  const keySeed = `${config.route}:${ip}:${userAgent.slice(0, 160)}`;
  const key = await sha256Hex(keySeed);

  const existing = await db
    .prepare<RateLimitRow>("SELECT request_count, window_start FROM astrologo_api_rate_limits WHERE key = ?")
    .bind(key)
    .first();

  const row = (existing ?? null) as RateLimitRow | null;

  if (!row || row.window_start !== windowStart) {
    await db
      .prepare(
        "INSERT OR REPLACE INTO astrologo_api_rate_limits (key, route, window_start, request_count, updated_at) VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)"
      )
      .bind(key, config.route, windowStart)
      .run();

    return {
      allowed: true,
      limit: config.limit,
      remaining: Math.max(config.limit - 1, 0),
      resetAt
    };
  }

  if (row.request_count >= config.limit) {
    return {
      allowed: false,
      limit: config.limit,
      remaining: 0,
      resetAt,
      retryAfter: Math.max(Math.ceil((resetAt - now) / 1000), 1)
    };
  }

  const nextCount = row.request_count + 1;
  await db
    .prepare("UPDATE astrologo_api_rate_limits SET request_count = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?")
    .bind(nextCount, key)
    .run();

  return {
    allowed: true,
    limit: config.limit,
    remaining: Math.max(config.limit - nextCount, 0),
    resetAt
  };
};

export const resolveRateLimitConfig = async (
  db: D1DatabaseLike,
  fallback: RateLimitConfig
): Promise<EffectiveRateLimitConfig> => {
  try {
    const policy = await db
      .prepare<RateLimitPolicyRow>("SELECT enabled, max_requests, window_minutes FROM astrologo_rate_limit_policies WHERE route = ?")
      .bind(fallback.route)
      .first();

    const row = (policy ?? null) as RateLimitPolicyRow | null;
    if (!row) {
      return { ...fallback, enabled: true };
    }

    const enabled = Number(row.enabled) !== 0;
    const limit = Math.max(1, Number(row.max_requests) || fallback.limit);
    const windowMs = Math.max(1, Number(row.window_minutes) || Math.round(fallback.windowMs / 60000)) * 60 * 1000;

    return {
      route: fallback.route,
      enabled,
      limit,
      windowMs
    };
  } catch {
    return { ...fallback, enabled: true };
  }
};
