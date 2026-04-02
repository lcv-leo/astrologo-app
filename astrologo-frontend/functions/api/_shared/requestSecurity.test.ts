import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getClientIp, getCorsHeaders, hasDisallowedOrigin, isAllowedLcvOrigin } from './requestSecurity';

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

  // enforceRateLimit and generic rate-limiting logic was moved out to Cloudflare WAF
});
