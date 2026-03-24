interface EnvBindings {
    BIGDATA_DB: { prepare: (q: string) => { bind: (...args: unknown[]) => { run: () => Promise<unknown> }; run: () => Promise<unknown> } };
}
interface Context { env: EnvBindings; request: Request; }

const securityHeaders = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Cross-Origin-Resource-Policy": "same-site"
};

const isAllowedLcvOrigin = (origin: string): boolean => /^https:\/\/([a-z0-9-]+\.)*lcv\.app\.br$/i.test(origin);

const getCorsHeaders = (request: Request) => {
    const origin = request.headers.get('Origin') || '';
    const allowOrigin = isAllowedLcvOrigin(origin) ? origin : "https://admin-astrologo.lcv.app.br";

    return {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };
};

const hasDisallowedOrigin = (request: Request): boolean => {
    const origin = request.headers.get('Origin');
    return !!origin && !isAllowedLcvOrigin(origin);
};

const ensurePolicyTable = async (env: EnvBindings) => {
    await env.BIGDATA_DB.prepare(`
        CREATE TABLE IF NOT EXISTS astrologo_rate_limit_policies (
            route TEXT PRIMARY KEY,
            enabled INTEGER NOT NULL DEFAULT 1,
            max_requests INTEGER NOT NULL,
            window_minutes INTEGER NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();
};

export async function onRequestOptions(context: Context) {
    return new Response(null, { headers: { ...getCorsHeaders(context.request), ...securityHeaders } });
}

export async function onRequestPost(context: Context) {
    const { env, request } = context;
    const corsHeaders = getCorsHeaders(request);

    if (hasDisallowedOrigin(request)) {
        return new Response(JSON.stringify({ success: false, error: "Origem não permitida." }), {
            status: 403,
            headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders }
        });
    }

    try {
        await ensurePolicyTable(env);
        const payload = await request.json() as { policies?: Array<{ route: string; enabled: boolean; max_requests: number; window_minutes: number }> };
        const policies = Array.isArray(payload.policies) ? payload.policies : [];
        const allowedRoutes = new Set(['astrologo/calcular', 'astrologo/analisar', 'astrologo/enviar-email']);

        for (const policy of policies) {
            if (!allowedRoutes.has(policy.route)) continue;
            const maxRequests = Math.max(1, Math.min(500, Number(policy.max_requests) || 1));
            const windowMinutes = Math.max(1, Math.min(1440, Number(policy.window_minutes) || 1));
            const enabled = policy.enabled ? 1 : 0;

            await env.BIGDATA_DB.prepare(`
                INSERT INTO astrologo_rate_limit_policies (route, enabled, max_requests, window_minutes, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(route) DO UPDATE SET
                    enabled = excluded.enabled,
                    max_requests = excluded.max_requests,
                    window_minutes = excluded.window_minutes,
                    updated_at = CURRENT_TIMESTAMP
            `).bind(policy.route, enabled, maxRequests, windowMinutes).run();
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders }
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro interno" }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders }
        });
    }
}
