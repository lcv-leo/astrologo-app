interface EnvBindings {
    DB: { prepare: (q: string) => { all: () => Promise<{ results: unknown[] }> } };
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
        const { results } = await env.DB.prepare(`SELECT id, nome, data_nascimento FROM mapas_astrologicos ORDER BY created_at DESC`).all();
        return new Response(JSON.stringify({ success: true, mapas: results }), { headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders } });
    } catch (error) {
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders } });
    }
}