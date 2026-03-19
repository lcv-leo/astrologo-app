interface EnvBindings { DB: { prepare: (q: string) => { bind: (...args: unknown[]) => { run: () => Promise<void> } } }; }
interface Context { env: EnvBindings; request: Request; }

export async function onRequestPost(context: Context) {
    const { env, request } = context;
    try {
        const payload = await request.json() as { id: string };
        const { id } = payload;
        await env.DB.prepare(`DELETE FROM mapas_astrologicos WHERE id = ?`).bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    } catch (error) {
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro ao apagar" }), { status: 500 });
    }
}