interface EnvBindings { RESEND_API_KEY: string; }
interface Context { request: Request; env: EnvBindings; }

const corsHeaders = {
    "Access-Control-Allow-Origin": "https://astrologo.lcv.app.br",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestOptions() {
    return new Response(null, { headers: corsHeaders });
}

export async function onRequestPost(context: Context) {
    const { request, env } = context;

    try {
        const payload = await request.json() as Record<string, string>;
        const { emailDestino, relatorioHtml, relatorioTexto, nomeConsulente } = payload;
        const RESEND_API_KEY = env.RESEND_API_KEY;

        if (!RESEND_API_KEY) {
            return new Response(JSON.stringify({ success: false, error: "Chave do Resend não encontrada." }), {
                status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }
            });
        }

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: "Oráculo Astrológico <astrologo@lcv.app.br>",
                to: [emailDestino],
                subject: `🌌 Dossiê Astrológico e Esotérico de ${nomeConsulente}`,
                html: relatorioHtml,
                text: relatorioTexto
            })
        });

        const data = await res.json() as Record<string, unknown>;

        if (res.ok) {
            return new Response(JSON.stringify({ success: true, message: "E-mail enviado com sucesso!" }), {
                headers: { "Content-Type": "application/json", ...corsHeaders }
            });
        } else {
            return new Response(JSON.stringify({ success: false, error: String(data.message) }), {
                status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }
            });
        }
    } catch {
        return new Response(JSON.stringify({ success: false, error: "Falha interna na comunicação do e-mail." }), {
            status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }
        });
    }
}
