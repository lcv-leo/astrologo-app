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
