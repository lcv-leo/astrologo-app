interface Env { DB: { prepare: (q: string) => { bind: (...args: unknown[]) => { first: () => Promise<unknown> } } }; }
interface Context { env: Env; request: Request; }

export async function onRequestPost(context: Context) {
    const { env, request } = context;
    try {
        const payload = await request.json() as { id: string };
        const { id } = payload;
        const mapa = await env.DB.prepare(`SELECT * FROM mapas_astrologicos WHERE id = ?`).bind(id).first();
        return new Response(JSON.stringify({ success: true, mapa }), { headers: { "Content-Type": "application/json" } });
    } catch (error) {
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro na leitura" }), { status: 500 });
    }
}