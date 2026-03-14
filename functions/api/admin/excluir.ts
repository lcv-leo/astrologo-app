export async function onRequestPost(context: any) {
  const { env, request } = context;
  try {
    const { id, senha } = await request.json();
    
    // 🗝️ A senha blindada extraída do cofre da Cloudflare
    const SENHA_ADMIN = env.SENHA_ADMIN;
    
    // Trava de segurança absoluta
    if (!SENHA_ADMIN || senha !== SENHA_ADMIN) {
      return new Response(JSON.stringify({error: "Acesso Negado."}), { status: 401 });
    }
    
    // A Incineração no Banco de Dados
    await env.DB.prepare(`DELETE FROM mapas_astrologicos WHERE id = ?`).bind(id).run();
    
    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}