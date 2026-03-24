// Módulo: astrologo-frontend/functions/api/analisar.ts
// Versão: v02.15.01 + Gemini v1beta Modernization
// Descrição: API de análise astrológica via Gemini v1beta com token counting, structured outputs, e caching otimizado.

import { enforceRateLimit, getCorsHeaders, hasDisallowedOrigin, rateLimitHeaders, resolveRateLimitConfig, securityHeaders, type D1DatabaseLike } from './_shared/requestSecurity';

// ==== TYPES PARA GOOGLE GEMINI API v1beta ====
interface EnvBindings { GEMINI_API_KEY: string; BIGDATA_DB: D1DatabaseLike; }
interface Context { request: Request; env: EnvBindings; }

/** Response do countTokens API (docs: v1beta/models:countTokens) */
interface TokenCountResponse {
  totalTokens?: number;
}

/** Response do generateContent API (docs: v1beta/models:generateContent) */
interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        thought?: boolean; // Ignorado se present (thinking model)
      }>;
    };
    finishReason?: string; // STOP, MAX_TOKENS, SAFETY, etc
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    cachedContentTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

/**
 * Logging estruturado com timestamp e contexto
 * (docs: best practice para debugging e observabilidade)
 */
function structuredLog(level: 'INFO' | 'WARN' | 'ERROR', message: string, context?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(context && { context })
  };
  console.log(JSON.stringify(logEntry));
}

const RATE_LIMIT = { route: 'astrologo/analisar', limit: 6, windowMs: 15 * 60 * 1000 };

// Configuração de modelo e valores de geração otimizados (Gemini v1beta)
const GEMINI_CONFIG = {
  model: 'gemini-pro-latest', // Latest stable, com fallback automático
  apiVersion: 'v1beta',
  maxOutputTokens: 8192, // Limite robusto de output (docs: importante para controle de custo)
  thinkingLevel: 'HIGH', // Raciocínio profundo para análises complexas
  cachedContentTTL: '3600s', // 1h cache de contexto (docs: reduz custo de prompt repetido)
};

// Endpoint para token counting (docs: countTokens API v1beta)
const countTokensEndpoint = (apiKey: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CONFIG.model}:countTokens?key=${apiKey}`;

// Endpoint para generateContent (docs: streaming disponível em v1beta)
const generateContentEndpoint = (apiKey: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CONFIG.model}:generateContent?key=${apiKey}`;

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

/**
 * Conta tokens da requisição (docs: countTokens API v1beta)
 * Permite validação pré-envio e otimização de custos
 */
const estimateTokenCount = async (prompt: string, apiKey: string): Promise<number> => {
  try {
    const resp = await fetch(countTokensEndpoint(apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          thinkingConfig: { thinkingLevel: GEMINI_CONFIG.thinkingLevel }
        }
      })
    });
    if (!resp.ok) {
      structuredLog('WARN', 'Token counting falhou, continuando sem contagem', { statusCode: resp.status });
      return -1; // Fallback sem contagem
    }
    const data = await resp.json() as TokenCountResponse;
    return data.totalTokens || -1;
  } catch (err) {
    structuredLog('WARN', 'Erro ao contar tokens', { error: String(err) });
    return -1;
  }
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

  const activeRateLimit = await resolveRateLimitConfig(env.BIGDATA_DB, RATE_LIMIT);

  const rateLimit = activeRateLimit.enabled
    ? await enforceRateLimit(env.BIGDATA_DB, request, activeRateLimit)
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

Retorne APENAS HTML formatado em <p>, <strong>, <ul>, <li>. Sem marcações markdown ou blocos de código e com os títulos alinhados à esquerda e os textos dos parágrafos justificados e com recuo de primeira linha de cada parágrafo.

USE OBRIGATORIAMENTE emojis e símbolos pictóricos Unicode ao longo de todo o texto: símbolos dos astros e planetas (☀️🌙⭐✨🪐💫🌟), dos signos do zodíaco (♈♉♊♋♌♍♎♏♐♑♒♓⛎), dos Orixás e entidades (⚔️🌊🔥🌿🌪️⚡🏹🌹🕯️💀🌺), de elementos esotéricos e místicos (🔮🧿📿☯️🌀🗝️🌑🌕), além de outros símbolos de reforço narrativo (🧠💡⚖️🌐🔗💎🛡️). Coloque-os no início dos títulos e seções, e intercale-os nos parágrafos para enriquecer a leitura e destacar conceitos-chave.`;

    // ==== PASSO 1: Token Counting (docs: countTokens API v1beta - best practice) ====
    structuredLog('INFO', 'Iniciando análise astrológica com Gemini v1beta', { prompt_length: prompt.length });
    
    const tokenCount = await estimateTokenCount(prompt, env.GEMINI_API_KEY);
    if (tokenCount > 0) {
      structuredLog('INFO', 'Token count estimado', { tokens: tokenCount, max_allowed: 128000 });
      if (tokenCount > 120000) {
        return new Response(JSON.stringify({ success: false, error: "Dados muito extensos para análise." }), {
          status: 413,
          headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders, ...limitHeaders }
        });
      }
    }

    // ==== PASSO 2: Requisição com retry e configuração otimizada (docs: streaming, maxTokens, improved safety) ====
    let response: Response | undefined;
    let lastErrorMsg = 'Desconhecido';
    
    for (let t = 0; t < 2; t++) {
      try {
        response = await fetch(generateContentEndpoint(env.GEMINI_API_KEY), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              thinkingConfig: { thinkingLevel: GEMINI_CONFIG.thinkingLevel },
              maxOutputTokens: GEMINI_CONFIG.maxOutputTokens, // Limite robusto (docs: importante)
              temperature: 1.0, // Recomendado para Gemini 3 (docs: evita looping)
              // topK: 40, // Default (comentado, usar default)
              // topP: 0.95, // Default (comentado, usar default)
            },
            // ==== IMPROVED SAFETY SETTINGS (docs: best practice v1beta) ====
            safetySettings: [
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }, // ← MELHORADO (era BLOCK_NONE)
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" }, // ← MELHORADO (era BLOCK_NONE)
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
              { category: "HARM_CATEGORY_CIVIC_INTEGRITY", threshold: "BLOCK_ONLY_HIGH" }, // ← NOVO
            ]
          })
        });
      } catch (fetchErr) {
        lastErrorMsg = String(fetchErr);
        structuredLog('WARN', `Tentativa ${t + 1}/2 falhou na requisição Gemini`, { error: lastErrorMsg });
        if (t === 0) await new Promise(r => setTimeout(r, 800));
        continue;
      }
      
      if (!response || !response.ok) {
        const statusCode = response?.status || 0;
        const respText = await response?.text() || '';
        lastErrorMsg = `HTTP ${statusCode}`;
        structuredLog('WARN', `Tentativa ${t + 1}/2: Resposta não-OK do Gemini`, { status: statusCode, response: respText.substring(0, 200) });
        if (t === 0) await new Promise(r => setTimeout(r, 800));
        continue;
      }
      
      break;
    }

    if (!response || !response.ok) {
      structuredLog('ERROR', 'Falha permanente no Gemini após retry', { lastError: lastErrorMsg });
      return new Response(JSON.stringify({ success: false, error: "Falha no provedor de IA." }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders, ...limitHeaders }
      });
    }

    // ==== PASSO 3: Parse response com verificação de thinking parts (docs: thinking models) ====
    const aiData = await response.json() as GeminiGenerateContentResponse;
    
    // Log de uso de tokens (docs: usage_metadata)
    if (aiData.usageMetadata) {
      structuredLog('INFO', 'Tokens utilizados na resposta', {
        prompt_tokens: aiData.usageMetadata.promptTokenCount,
        cached_tokens: aiData.usageMetadata.cachedContentTokenCount,
        output_tokens: aiData.usageMetadata.candidatesTokenCount,
        total_tokens: aiData.usageMetadata.totalTokenCount,
      });
    }

    const candidates = aiData?.candidates;
    if (!candidates || candidates.length === 0) {
      structuredLog('WARN', 'Nenhum candidate na resposta Gemini', { finishReason: candidates?.[0]?.finishReason });
      return new Response(JSON.stringify({ success: false, error: "Resposta vazia do modelo." }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders, ...limitHeaders }
      });
    }

    const content = candidates[0]?.content;
    const parts = content?.parts;
    
    // Filtrar partes visíveis (ignorar thinking parts de modelos thinking; docs: thinking model responses)
    const visibleParts = (parts || []).filter(p => p.text && !p.thought);
    let analise = visibleParts.map(p => p.text).join('\n\n') || parts?.[0]?.text || "<p>Perturbação no éter na geração.</p>";
    
    analise = sanitizeGeneratedHtml(analise);
    if (!analise || analise.trim().length === 0) {
      analise = "<p>Perturbação no éter na geração.</p>";
    }

    // ==== PASSO 4: Persistência no banco (D1) ====
    if (env.BIGDATA_DB && id && typeof id === 'string') {
      try {
        try {
          await env.BIGDATA_DB.prepare("UPDATE astrologo_mapas SET analise_ia = ?, data_analise = datetime('now') WHERE id = ?")
            .bind(analise, id)
            .run();
        } catch (firstPersistErr) {
          const firstMessage = String(firstPersistErr);
          const missingDataAnaliseColumn = /no such column:\s*data_analise/i.test(firstMessage);

          if (!missingDataAnaliseColumn) {
            throw firstPersistErr;
          }

          structuredLog('WARN', 'Coluna data_analise ausente, aplicando fallback de persistência', {
            id,
            error: firstMessage
          });

          await env.BIGDATA_DB.prepare("UPDATE astrologo_mapas SET analise_ia = ? WHERE id = ?")
            .bind(analise, id)
            .run();
        }

        structuredLog('INFO', 'Análise persistida no banco', { id });
      } catch (dbErr) {
        structuredLog('WARN', "Erro ao persistir análise no banco (continuando)", { error: String(dbErr) });
      }
    }

    structuredLog('INFO', 'Análise gerada com sucesso', { analise_length: analise.length });
    return new Response(JSON.stringify({ success: true, analise }), { 
      headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders, ...limitHeaders } 
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    structuredLog('ERROR', 'Erro não-tratado na análise astrológica', { error: errorMessage, stack: err instanceof Error ? err.stack : undefined });
    return new Response(JSON.stringify({ success: false, error: "Falha na comunicação Cósmica." }), { 
      status: 500, 
      headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders, ...limitHeaders } 
    });
  }
}