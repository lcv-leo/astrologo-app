// Módulo: astrologo-frontend/functions/api/analisar.ts
// Versão: v02.15.01 + Gemini v1beta Modernization
// Descrição: API de análise astrológica via Gemini v1beta com token counting, structured outputs, e caching otimizado.

import { getCorsHeaders, hasDisallowedOrigin, securityHeaders, type D1DatabaseLike } from './_shared/requestSecurity';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';

interface EnvBindings { 
  GEMINI_API_KEY: string; 
  BIGDATA_DB: D1DatabaseLike; 
  GLOBAL_RATE_LIMITER: { limit: (options: { key: string }) => Promise<{ success: boolean }> };
}
interface Context { request: Request; env: EnvBindings; }

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

// Configuração de modelo e valores de geração otimizados (Gemini v1beta)
const GEMINI_CONFIG_DEFAULTS = {
  model: '', // Fallback dinâmico padrão
  apiVersion: 'v1beta',
  maxOutputTokens: 8192, // Limite robusto de output (docs: importante para controle de custo)
  cachedContentTTL: '3600s', // 1h cache de contexto (docs: reduz custo de prompt repetido)
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const sanitizeGeneratedHtml = (input: string): string => {
  const normalized = input
    .replace(/```html/gi, '')
    .replace(/```/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  if (!normalized) {
    return '<p>Perturbação no éter na geração.</p>';
  }

  const escaped = escapeHtml(normalized);
  return escaped
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, '<br>')}</p>`)
    .join('');
};

/**
 * Conta tokens da requisição usando @google/genai SDK
 * Permite validação pré-envio e otimização de custos
 */
const estimateTokenCount = async (ai: GoogleGenAI, prompt: string, model: string): Promise<number> => {
  try {
    const resp = await ai.models.countTokens({
      model,
      contents: prompt
    });
    return resp.totalTokens ?? -1;
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

  const ipForRatelimit = request.headers.get("CF-Connecting-IP") || "unknown";
  
  // Utilização nativa do Cloudflare Rate Limiter Binding via wrangler.json `GLOBAL_RATE_LIMITER`
  let rateLimitAllowed = true;
  if (env.GLOBAL_RATE_LIMITER) {
    const { success } = await env.GLOBAL_RATE_LIMITER.limit({ key: `astrologo/analisar:${ipForRatelimit}` });
    rateLimitAllowed = success;
  } else {
    structuredLog('WARN', 'GLOBAL_RATE_LIMITER env binding não está injetado na cloudflare. Ratelimiting ignorado!');
  }

  if (!rateLimitAllowed) {
    return new Response(JSON.stringify({ success: false, error: "Muitas análises em sequência. Aguarde antes de solicitar outra." }), {
      status: 429,
      headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders }
    });
  }

  try {
    const payload = await request.json() as Record<string, unknown>;
    const { id, dadosAstronomica, dadosTropical, dadosGlobais, query } = payload;

    if (!dadosAstronomica || !dadosTropical || !dadosGlobais || !query) {
      return new Response(JSON.stringify({ success: false, error: "Dados insuficientes para análise." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders }
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

    // ==== DYNAMIC MODEL CONFIGURATION VIA BIGDATA_DB ====
    let selectedModel = GEMINI_CONFIG_DEFAULTS.model;
    if (env.BIGDATA_DB && typeof env.BIGDATA_DB.prepare === 'function') {
      try {
        const configRow = await env.BIGDATA_DB.prepare(
          "SELECT config_json FROM admin_config_store WHERE config_key = 'astrologo-config' LIMIT 1"
        ).first() as { config_json?: string } | null;
        if (configRow && configRow.config_json) {
          const parsedConfig = JSON.parse(configRow.config_json);
          if (parsedConfig && typeof parsedConfig.modeloIA === 'string' && parsedConfig.modeloIA.trim()) {
            selectedModel = parsedConfig.modeloIA.trim();
          }
        }
      } catch (err) {
        structuredLog('WARN', 'Falha ao recuperar astrologo-config de BIGDATA_DB, usando fallback', { error: String(err) });
      }
    }

    // Inicializa a instância do SDK de vanguarda
    const ai = new GoogleGenAI({ 
      apiKey: env.GEMINI_API_KEY
    });

    // ==== PASSO 1: Token Counting API (v1beta - best practice) ====
    structuredLog('INFO', 'Iniciando análise astrológica com Gemini SDK', { prompt_length: prompt.length, model: selectedModel });
    
    const tokenCount = await estimateTokenCount(ai, prompt, selectedModel);
    if (tokenCount > 0) {
      structuredLog('INFO', 'Token count estimado', { tokens: tokenCount, max_allowed: 128000 });
      if (tokenCount > 120000) {
        return new Response(JSON.stringify({ success: false, error: "Dados muito extensos para análise." }), {
          status: 413,
          headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders }
        });
      }
    }

    // ==== PASSO 2: Requisição com retry e configuração otimizada através do SDK ====
    let lastErrorMsg = 'Desconhecido';
    let generationResult;
    
    for (let t = 0; t < 2; t++) {
      try {
        generationResult = await ai.models.generateContent({
          model: selectedModel,
          contents: prompt,
          config: {
            maxOutputTokens: GEMINI_CONFIG_DEFAULTS.maxOutputTokens, // Limite robusto (docs: importante)
            temperature: 1.0, // Recomendado para Gemini Flash (docs: evita looping)
            // ==== IMPROVED SAFETY SETTINGS (docs: best practice v1beta) ====
            safetySettings: [
              { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
              { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
              { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
              { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
              { category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ]
          }
        });
        break; // Sucesso, quebra o loop de retry
      } catch (fetchErr) {
        lastErrorMsg = String(fetchErr);
        structuredLog('WARN', `Tentativa ${t + 1}/2 falhou na requisição Gemini SDK`, { error: lastErrorMsg });
        if (t === 0) await new Promise(r => setTimeout(r, 800));
        continue;
      }
    }
    
    if (!generationResult || !generationResult.text) {
      structuredLog('ERROR', 'Ambas as tentativas falharam ou retornaram status de erro/incompleto', { error: lastErrorMsg });
      return new Response(JSON.stringify({ success: false, error: "Servidor superlotado (Aviso Oculto #77). Tente novamente." }), {
        status: 504,
        headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders }
      });
    }

    // ==== PASSO 3: Parse da Resposta e Extração de Tokens Otimizado ====
    const generatedText = generationResult.text;
    let analise = sanitizeGeneratedHtml(generatedText);

    if (!analise || analise.trim().length === 0) {
      analise = "<p>Perturbação no éter na geração.</p>";
    }

    structuredLog('INFO', 'Análise gerada com sucesso via SDK', { 
      bytesHtml: analise.length,
      usage: generationResult.usageMetadata
    });

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
      headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders } 
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    structuredLog('ERROR', 'Erro não-tratado na análise astrológica', { error: errorMessage, stack: err instanceof Error ? err.stack : undefined });
    return new Response(JSON.stringify({ success: false, error: "Falha na comunicação Cósmica." }), { 
      status: 500, 
      headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders } 
    });
  }
}