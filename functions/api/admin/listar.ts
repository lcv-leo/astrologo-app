export async function onRequestGet(context: any) {
  const { env, request } = context;
  const url = new URL(request.url);
  
  // 🗝️ A senha agora é blindada e extraída diretamente do cofre da Cloudflare
  const SENHA_ADMIN = env.SENHA_ADMIN;
  
  // Segurança Extra: Se a senha não existir na nuvem ou for digitada errada, bloqueia.
  if (!SENHA_ADMIN || url.searchParams.get("senha") !== SENHA_ADMIN) {
    return new Response(JSON.stringify({error: "Acesso Negado."}), { status: 401 });
  }
  
  try {
    const { results } = await env.DB.prepare(`SELECT id, nome, data_nascimento FROM mapas_astrologicos ORDER BY created_at DESC`).all();
    return new Response(JSON.stringify({ success: true, mapas: results }), { headers: { "Content-Type": "application/json" } });
  } catch (error: any) { return new Response(JSON.stringify({ error: error.message }), { status: 500 }); }
}