interface Env { DB: { prepare: (q: string) => { all: () => Promise<{ results: unknown[] }> } }; }
interface Context { env: Env; }

export async function onRequestGet(context: Context) {
    const { env } = context;
    try {
        const { results } = await env.DB.prepare(`SELECT id, nome, data_nascimento FROM mapas_astrologicos ORDER BY created_at DESC`).all();
        return new Response(JSON.stringify({ success: true, mapas: results }), { headers: { "Content-Type": "application/json" } });
    } catch (error) {
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }), { status: 500 });
    }
}