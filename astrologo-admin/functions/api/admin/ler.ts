interface Env {
    DB: { prepare: (q: string) => { bind: (...args: unknown[]) => { first: () => Promise<unknown> } } };
}
interface Context { env: Env; request: Request; }

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
        const payload = await request.json() as { id: string };
        const { id } = payload;
        if (!id) {
            return new Response(JSON.stringify({ success: false, error: "ID inválido." }), {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders }
            });
        }

        const mapa = await env.DB.prepare(`SELECT * FROM mapas_astrologicos WHERE id = ?`).bind(id).first();
        return new Response(JSON.stringify({ success: true, mapa }), { headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders } });
    } catch (error) {
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro na leitura" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders } });
    }
}