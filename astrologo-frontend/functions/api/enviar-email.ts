import { enforceRateLimit, getCorsHeaders, hasDisallowedOrigin, rateLimitHeaders, resolveRateLimitConfig, securityHeaders, type D1DatabaseLike } from './_shared/requestSecurity';

interface EnvBindings { RESEND_API_KEY: string; DB: D1DatabaseLike; }
interface Context { request: Request; env: EnvBindings; }

const RATE_LIMIT = { route: 'enviar-email', limit: 4, windowMs: 60 * 60 * 1000 };

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export async function onRequestOptions(context: Context) {
    return new Response(null, { headers: { ...getCorsHeaders(context.request, 'https://mapa-astral.lcv.app.br'), ...securityHeaders } });
}

export async function onRequestPost(context: Context) {
    const { request, env } = context;
    const corsHeaders = getCorsHeaders(request, 'https://mapa-astral.lcv.app.br');

    if (hasDisallowedOrigin(request)) {
        return new Response(JSON.stringify({ success: false, error: "Origem não permitida." }), {
            status: 403,
            headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders }
        });
    }

    const activeRateLimit = await resolveRateLimitConfig(env.DB, RATE_LIMIT);

    const rateLimit = activeRateLimit.enabled
        ? await enforceRateLimit(env.DB, request, activeRateLimit)
        : { allowed: true, limit: activeRateLimit.limit, remaining: activeRateLimit.limit, resetAt: Date.now() + activeRateLimit.windowMs };

    const limitHeaders = rateLimitHeaders(rateLimit);

    if (!rateLimit.allowed) {
        return new Response(JSON.stringify({ success: false, error: "Limite de envios atingido temporariamente. Aguarde antes de tentar novamente." }), {
            status: 429,
            headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders, ...limitHeaders }
        });
    }

    try {
        const payload = await request.json() as Record<string, string>;
        const emailDestino = String(payload.emailDestino ?? '').trim();
        const relatorioHtml = String(payload.relatorioHtml ?? '');
        const relatorioTexto = String(payload.relatorioTexto ?? '');
        const nomeConsulente = String(payload.nomeConsulente ?? '').trim();
        const RESEND_API_KEY = env.RESEND_API_KEY;

        if (!isValidEmail(emailDestino)) {
            return new Response(JSON.stringify({ success: false, error: "E-mail de destino inválido." }), {
                status: 400, headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders, ...limitHeaders }
            });
        }
        if (!relatorioHtml && !relatorioTexto) {
            return new Response(JSON.stringify({ success: false, error: "Relatório vazio." }), {
                status: 400, headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders, ...limitHeaders }
            });
        }

        if (!RESEND_API_KEY) {
            return new Response(JSON.stringify({ success: false, error: "Chave do Resend não encontrada." }), {
                status: 500, headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders, ...limitHeaders }
            });
        }

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: "Oráculo Astrológico <astrologo@lcv.app.br>",
                to: [emailDestino],
                subject: `🌌 Dossiê Astrológico e Esotérico de ${nomeConsulente}`,
                html: relatorioHtml,
                text: relatorioTexto
            })
        });

        const data = await res.json() as Record<string, unknown>;

        if (res.ok) {
            return new Response(JSON.stringify({ success: true, message: "E-mail enviado com sucesso!" }), {
                headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders, ...limitHeaders }
            });
        } else {
            return new Response(JSON.stringify({ success: false, error: String(data.message) }), {
                status: 500, headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders, ...limitHeaders }
            });
        }
    } catch {
        return new Response(JSON.stringify({ success: false, error: "Falha interna na comunicação do e-mail." }), {
            status: 500, headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders, ...limitHeaders }
        });
    }
}