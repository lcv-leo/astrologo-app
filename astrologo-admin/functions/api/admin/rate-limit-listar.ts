interface EnvBindings {
    DB: { prepare: (q: string) => { all: () => Promise<{ results: unknown[] }>; run: () => Promise<unknown> } };
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
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };
};

const hasDisallowedOrigin = (request: Request): boolean => {
    const origin = request.headers.get('Origin');
    return !!origin && !isAllowedLcvOrigin(origin);
};

const ensurePolicyTable = async (env: EnvBindings) => {
    await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS rate_limit_policies (
            route TEXT PRIMARY KEY,
            enabled INTEGER NOT NULL DEFAULT 1,
            max_requests INTEGER NOT NULL,
            window_minutes INTEGER NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    await env.DB.prepare(`INSERT OR IGNORE INTO rate_limit_policies (route, enabled, max_requests, window_minutes) VALUES ('calcular', 1, 10, 10)`).run();
    await env.DB.prepare(`INSERT OR IGNORE INTO rate_limit_policies (route, enabled, max_requests, window_minutes) VALUES ('analisar', 1, 6, 15)`).run();
    await env.DB.prepare(`INSERT OR IGNORE INTO rate_limit_policies (route, enabled, max_requests, window_minutes) VALUES ('enviar-email', 1, 4, 60)`).run();
};

export async function onRequestOptions(context: Context) {
    return new Response(null, { headers: { ...getCorsHeaders(context.request), ...securityHeaders } });
}

export async function onRequestGet(context: Context) {
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
        const { results } = await env.DB.prepare(`SELECT route, enabled, max_requests, window_minutes FROM rate_limit_policies ORDER BY route ASC`).all();
        return new Response(JSON.stringify({ success: true, policies: results }), {
            headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders }
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro interno" }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders }
        });
    }
}
