// Módulo: astrologo-frontend/functions/api/analisar.ts
// Versão: v02.14.00
// Descrição: API de análise astrológica via Gemini — v1beta, gemini-pro-latest, thinkingLevel HIGH, safetySettings, retry.

import { enforceRateLimit, getCorsHeaders, hasDisallowedOrigin, rateLimitHeaders, resolveRateLimitConfig, securityHeaders, type D1DatabaseLike } from './_shared/requestSecurity';

interface EnvBindings { GEMINI_API_KEY: string; DB: D1DatabaseLike; }
interface Context { request: Request; env: EnvBindings; }

const RATE_LIMIT = { route: 'analisar', limit: 6, windowMs: 15 * 60 * 1000 };

const sanitizeGeneratedHtml = (input: string): string => {
  const withoutFences = input.replace(/```html/gi, '').replace(/```/g, '');

  return withoutFences
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select|svg|math)[^>]*>[\s\S]*?<\s*\/\s*\1>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select|svg|math)[^>]*\/?>/gi, '')
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\sstyle\s*=\s*(['"]).*?\1/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<(?!\/?(p|strong|ul|li|em|b|i|h1|h2|h3|br)\b)[^>]*>/gi, '')
    .replace(/<(p|strong|ul|li|em|b|i|h1|h2|h3|br)\s[^>]*>/gi, '<$1>')
    .trim();
};

export async function onRequestOptions(context: Context) {
  return new Response(null, { headers: { ...getCorsHeaders(context.request, 'https://mapa-astral.lcv.app.br'), ...securityHeaders } });
}

export async function onRequestPost(context: Context) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request, 'https://mapa-astral.lcv.app.br');

  if (hasDisallowedOrigin(request)) {
    return new Response(JSON.stringify({ success: false, error: "Origem não permitida." }), {
      status: 403,
      headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders }
    });
  }

  const activeRateLimit = await resolveRateLimitConfig(env.DB, RATE_LIMIT);

  const rateLimit = activeRateLimit.enabled
    ? await enforceRateLimit(env.DB, request, activeRateLimit)
    : { allowed: true, limit: activeRateLimit.limit, remaining: activeRateLimit.limit, resetAt: Date.now() + activeRateLimit.windowMs };

  const limitHeaders = rateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ success: false, error: "Muitas análises em sequência. Aguarde antes de solicitar outra." }), {
      status: 429,
      headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders, ...limitHeaders }
    });
  }

  try {
    const payload = await request.json() as Record<string, unknown>;
    const { id, dadosAstronomica, dadosTropical, dadosGlobais, query } = payload;

    if (!dadosAstronomica || !dadosTropical || !dadosGlobais || !query) {
      return new Response(JSON.stringify({ success: false, error: "Dados insuficientes para análise." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders, ...limitHeaders }
      });
    }

    const dadosAnalise = `Sistema Tropical: ${JSON.stringify(dadosTropical)} | Sistema Astronômico Constelacional: ${JSON.stringify(dadosAstronomica)} | Globais (Tatwas e Numerologia): ${JSON.stringify(dadosGlobais)}`;

    const prompt = `Atue como um Mestre Iniciador da Umbanda Esotérica da Raiz de Guiné e Psicanalista Junguiano.
Dados calculados astrologicamente: ${dadosAnalise} do consulente: ${JSON.stringify(query)}

O aplicativo exibe ao usuário uma jornada narrativa de choque de realidade: PRIMEIRO apresentamos a Astrologia Tropical (12 signos) como a máscara terrena/Ego, e DEPOIS a Astrologia Astronômica Constelacional (13 signos) como a verdade estelar oculta/Alma.
Siga EXATAMENTE esta mesma ordem! Faça DUAS análises profundas e separadas:
1º. Astrologia Tropical (A Persona)
2º. Astrologia Astronômica (A Essência da Alma)
Integre a Astrologia, a Umbanda Esotérica da Raiz de Guiné de W. W. da Matta e Silva, os Tatwas e a Psicologia Analítica de C. G. Jung. Ao final, efetue uma síntese conjunta comparativa.

ATENÇÃO RIGOROSA 1: Analise a influência do "Astro" (o 6º card da Umbanda, que representa a Hora Planetária do minuto exato baseada na Sequência dos Caldeus) e sua sinergia com o Orixá regente.
ATENÇÃO RIGOROSA 2: Inclua de forma explícita e obrigatória a informação de que a Coroa calculada via data de nascimento serve para revelar a Vibração Original "Teórica/Magnética". Informe claramente que, por necessidades e cobranças cármicas de encarnação, a entidade que atua "de frente" pode pertencer a outra Linha, e que a verdadeira coroa e guias de frente só podem ser atestados de forma inequívoca e prática no terreiro através da "Lei de Pemba" e pelo Mestre de Iniciação.

Retorne APENAS HTML formatado em <p>, <strong>, <ul>, <li>. Sem marcações markdown ou blocos de código e com os títulos alinhados à esquerda e os textos dos parágrafos justificados e com recuo de primeira linha de cada parágrafo.`;

    // Retry: 1 tentativa extra em caso de falha transitória
    let response: Response;
    for (let t = 0; t < 2; t++) {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${env.GEMINI_API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { thinkingConfig: { thinkingLevel: "HIGH" } },
          safetySettings: [
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          ]
        })
      });
      if (response!.ok) break;
      if (t === 0) await new Promise(r => setTimeout(r, 800));
    }

    if (!response!.ok) {
      return new Response(JSON.stringify({ success: false, error: "Falha no provedor de IA." }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders, ...limitHeaders }
      });
    }

    const aiData = await response!.json() as Record<string, unknown>;
    const candidates = aiData?.candidates as Array<Record<string, unknown>>;
    const content = candidates?.[0]?.content as Record<string, unknown>;
    const parts = content?.parts as Array<Record<string, string | boolean>>;
    // Filtrar partes visíveis (ignorar thoughts de modelos thinking)
    const visibleParts = (parts || []).filter(p => p.text && !p.thought);
    let analise = visibleParts.map(p => p.text).join('') || parts?.[0]?.text as string || "<p>Perturbação no éter na geração.</p>";
    analise = sanitizeGeneratedHtml(analise);
    if (!analise) analise = "<p>Perturbação no éter na geração.</p>";

    if (env.DB && id && typeof id === 'string') {
      try { await env.DB.prepare("UPDATE mapas_astrologicos SET analise_ia = ? WHERE id = ?").bind(analise, id).run(); }
      catch { console.warn("Erro silencioso ao atualizar análise no banco."); }
    }

    return new Response(JSON.stringify({ success: true, analise }), { headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders, ...limitHeaders } });
  } catch {
    return new Response(JSON.stringify({ success: false, error: "Falha na comunicação Cósmica." }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders, ...limitHeaders } });
  }
}