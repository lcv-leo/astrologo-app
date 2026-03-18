export async function onRequestPost(context: any) {
    const { request, env } = context;

    try {
        const { emailDestino, relatorioHtml, relatorioTexto, nomeConsulente } = await request.json();
        const RESEND_API_KEY = env.RESEND_API_KEY;

        if (!RESEND_API_KEY) {
            return new Response(JSON.stringify({ success: false, error: "A Chave do Resend não foi encontrada." }), { status: 500 });
        }

        const emailRemetente = "Oráculo Astrológico <astrologo@lcv.app.br>";

        const res = await fetch('[https://api.resend.com/emails](https://api.resend.com/emails)', {
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
                text: relatorioTexto
            })
        });

        const data = await res.json();

        if (res.ok) {
            return new Response(JSON.stringify({ success: true, message: "E-mail enviado com sucesso!" }), { headers: { "Content-Type": "application/json" } });
        } else {
            return new Response(JSON.stringify({ success: false, error: data.message }), { status: 500 });
        }
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: "Falha interna na comunicação do e-mail." }), { status: 500 });
    }
}