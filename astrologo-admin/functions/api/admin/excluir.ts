export async function onRequestPost(context: any) {
    const { env, request } = context;
    try {
        const { id } = await request.json();
        await env.DB.prepare(`DELETE FROM mapas_astrologicos WHERE id = ?`).bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    } catch (error: any) { return new Response(JSON.stringify({ error: error.message }), { status: 500 }); }
}