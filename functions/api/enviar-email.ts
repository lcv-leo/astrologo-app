export async function onRequestPost(context: any) {
  const { request, env } = context;

  try {
    const { emailDestino, relatorioHtml, relatorioTexto, nomeConsulente } = await request.json();
    
    // Invocando a chave secreta do cofre da Cloudflare
    const RESEND_API_KEY = env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: "A Chave do Resend não foi encontrada no cofre." }), { status: 500 });
    }

    // =======================================================================
    // ⚠️ AVISO VITAL DO MESTRE SOBRE A CAIXA DE AREIA (SANDBOX):
    // Como o seu domínio ainda não foi verificado, o Resend o coloca na Sandbox.
    // O remetente DEVE SER estritamente: "onboarding@resend.dev"
    // E você SÓ PODE enviar testes para o SEU PRÓPRIO E-MAIL de cadastro.
    //
    // Após verificar o domínio (lcv.xyz.br) no painel deles, volte aqui e mude para:
    // const emailRemetente = "Oráculo Astrológico <oraculo@lcv.xyz.br>";
    // =======================================================================
    const emailRemetente = "Oráculo Astrológico <astrologo@lcv.app.br>";

    // O Disparo Mágico via API nativa do Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: emailRemetente,
        to: [emailDestino],
        subject: `🌌 Dossiê Astrológico e Esotérico de ${nomeConsulente}`,
        html: relatorioHtml,
        text: relatorioTexto // Usado como fallback e evita cair no Spam
      })
    });

    const data = await res.json();

    if (res.ok) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "O Dossiê Celestial foi materializado com sucesso na caixa de entrada!" 
      }), { headers: { "Content-Type": "application/json" } });
    } else {
      console.error("A rede rejeitou o envio:", data);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `A magia foi bloqueada: ${data.message}` 
      }), { status: 500 });
    }

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: "Falha na ponte de comunicação cósmica." }), { status: 500 });
  }
}