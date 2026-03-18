export async function onRequestPost(context: any) {
    const { env, request } = context;
    try {
        const { id } = await request.json();
        const mapa = await env.DB.prepare(`SELECT * FROM mapas_astrologicos WHERE id = ?`).bind(id).first();
        return new Response(JSON.stringify({ success: true, mapa }), { headers: { "Content-Type": "application/json" } });
    } catch (error: any) { return new Response(JSON.stringify({ error: error.message }), { status: 500 }); }
}