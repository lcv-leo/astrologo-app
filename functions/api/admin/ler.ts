export async function onRequestPost(context: any) {
  const { env, request } = context;
  try {
    const { id, senha } = await request.json();
    
    // 🗝️ A senha blindada extraída do cofre da Cloudflare
    const SENHA_ADMIN = env.SENHA_ADMIN;
    
    // Segurança Extra: Bloqueia tentativa inválida
    if (!SENHA_ADMIN || senha !== SENHA_ADMIN) {
      return new Response(JSON.stringify({error: "Acesso Negado."}), { status: 401 });
    }
    
    const mapa = await env.DB.prepare(`SELECT * FROM mapas_astrologicos WHERE id = ?`).bind(id).first();
    return new Response(JSON.stringify({ success: true, mapa }), { headers: { "Content-Type": "application/json" } });
  } catch (error: any) { return new Response(JSON.stringify({ error: error.message }), { status: 500 }); }
}