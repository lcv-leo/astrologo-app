import { beforeEach, describe, expect, it, vi } from 'vitest';
import { enforceRateLimit, getClientIp, getCorsHeaders, hasDisallowedOrigin, isAllowedLcvOrigin, rateLimitHeaders, type D1DatabaseLike } from './requestSecurity';

const createRequest = (origin?: string, extraHeaders: Record<string, string> = {}) => {
  const headers = new Headers(extraHeaders);
  if (origin) headers.set('Origin', origin);
  return new Request('https://mapa-astral.lcv.app.br/api/teste', { headers });
};

describe('requestSecurity', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('aceita apenas origens https em lcv.app.br', () => {
    expect(isAllowedLcvOrigin('https://mapa-astral.lcv.app.br')).toBe(true);
    expect(isAllowedLcvOrigin('https://admin-astrologo.lcv.app.br')).toBe(true);
    expect(isAllowedLcvOrigin('http://mapa-astral.lcv.app.br')).toBe(false);
    expect(isAllowedLcvOrigin('https://evil.com')).toBe(false);
  });

  it('gera cabeçalhos CORS com fallback controlado', () => {
    const allowed = getCorsHeaders(createRequest('https://mapa-astral.lcv.app.br'), 'https://mapa-astral.lcv.app.br');
    const denied = getCorsHeaders(createRequest('https://evil.com'), 'https://mapa-astral.lcv.app.br');

    expect(allowed['Access-Control-Allow-Origin']).toBe('https://mapa-astral.lcv.app.br');
    expect(denied['Access-Control-Allow-Origin']).toBe('https://mapa-astral.lcv.app.br');
  });

  it('detecta origem não permitida', () => {
    expect(hasDisallowedOrigin(createRequest('https://evil.com'))).toBe(true);
    expect(hasDisallowedOrigin(createRequest('https://mapa-astral.lcv.app.br'))).toBe(false);
    expect(hasDisallowedOrigin(createRequest(undefined))).toBe(false);
  });

  it('extrai IP priorizando cabeçalhos do Cloudflare', () => {
    expect(getClientIp(createRequest(undefined, { 'CF-Connecting-IP': '1.2.3.4' }))).toBe('1.2.3.4');
    expect(getClientIp(createRequest(undefined, { 'X-Forwarded-For': '5.6.7.8, 9.9.9.9' }))).toBe('5.6.7.8');
  });

  it('inclui cabeçalhos de rate limit', () => {
    const headers = rateLimitHeaders({ allowed: true, limit: 10, remaining: 8, resetAt: 1710000000000 });
    expect(headers['X-RateLimit-Limit']).toBe('10');
    expect(headers['X-RateLimit-Remaining']).toBe('8');
  });

  it('aplica rate limit por janela', async () => {
    const state = new Map<string, { request_count: number; window_start: number }>();
    vi.spyOn(Date, 'now').mockReturnValue(1710000000000);

    const db = {
      prepare: (query: string) => ({
        bind: (...args: unknown[]) => ({
          first: async () => {
            if (!query.startsWith('SELECT')) return null;
            return state.get(String(args[0])) ?? null;
          },
          run: async () => {
            if (query.startsWith('INSERT OR REPLACE')) {
              state.set(String(args[0]), { request_count: 1, window_start: Number(args[2]) });
            } else if (query.startsWith('UPDATE')) {
              const key = String(args[1]);
              const current = state.get(key);
              if (current) {
                state.set(key, { ...current, request_count: Number(args[0]) });
              }
            }
            return {};
          }
        })
      })
    } as unknown as D1DatabaseLike;

    const request = createRequest('https://mapa-astral.lcv.app.br', {
      'CF-Connecting-IP': '10.0.0.1',
      'User-Agent': 'Vitest'
    });

    const first = await enforceRateLimit(db, request, { route: 'calcular', limit: 2, windowMs: 60_000 });
    const second = await enforceRateLimit(db, request, { route: 'calcular', limit: 2, windowMs: 60_000 });
    const third = await enforceRateLimit(db, request, { route: 'calcular', limit: 2, windowMs: 60_000 });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
    expect(third.retryAfter).toBeGreaterThan(0);
  });
});
