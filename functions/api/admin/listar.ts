export async function onRequestGet(context: any) {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare(`SELECT id, nome, data_nascimento FROM mapas_astrologicos ORDER BY created_at DESC`).all();
    return new Response(JSON.stringify({ success: true, mapas: results }), { headers: { "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}