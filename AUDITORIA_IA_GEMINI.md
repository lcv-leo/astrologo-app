# 📋 AUDITORIA TÉCNICA: Integrações de IA — Projeto Astrólogo-App

**Data da Auditoria:** 23/03/2026  
**Versão da Aplicação:** APP v02.15.00  
**Provedor de IA:** Google Gemini  
**Status:** ✅ Ativo em Produção

---

## 📊 SUMÁRIO EXECUTIVO

### Referências de IA Identificadas: **2 Endpoints**
- ✅ **analisar.ts** — Análise astrológica + esotérica via Gemini v1beta
- ✅ **calcular.ts** — Preparação de dados astrométricos (sem IA direta)

### Modelo & Versão API
- **Provedor:** Google Gemini (Google AI / GenerativeLanguage API)
- **Modelo Atual:** `gemini-pro-latest`
- **Versão da API:** `v1beta` (não v1)
- **Status:** ✅ Operacional, sem deprecação detectada

### Recursos de IA Utilizados
- ✅ Inference básico (generateContent)
- ✅ Thinking Mode (thinkingLevel: HIGH)
- ✅ Safety Settings (4 categorias)
- ❌ Streaming
- ❌ Vision/Images
- ❌ Embeddings
- ❌ Function Calling / Tools

---

## 🗂️ MAPA DE ARQUIVOS COM REFERÊNCIA A IA

### 1️⃣ **astrologo-frontend/functions/api/analisar.ts**
**Status:** ⚠️ CRÍTICO — Dependência direta de Gemini v1beta

| Propriedade | Valor |
|---|---|
| **Caminho** | `astrologo-app/astrologo-frontend/functions/api/analisar.ts` |
| **Versão** | v02.15.00 |
| **Linhas de Código** | ~150 (arquivo completo) |
| **Descrição** | API de análise astrológica via Gemini — v1beta, gemini-pro-latest, thinkingLevel HIGH, safetySettings, retry, emojis obrigatórios no prompt |

#### 🔌 Integração Gemini — Detalhes Técnicos

**Endpoint HTTP:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key={GEMINI_API_KEY}
```
- **Linha:** 88
- **Método:** fetch() com retry automático (2 tentativas, delay de 800ms entre elas)

**Chave de Configuração:**
```typescript
interface EnvBindings { GEMINI_API_KEY: string; DB: D1DatabaseLike; }
```
- **Variável de Ambiente:** `GEMINI_API_KEY`
- **Tipo:** string (chave API da Google)
- **Localização:** `.env` (raiz do projeto)

**Payload da Requisição (linhas 88-101):**
```json
{
  "contents": [
    {
      "parts": [
        { "text": "[PROMPT COMPLETO]" }
      ]
    }
  ],
  "generationConfig": {
    "thinkingConfig": {
      "thinkingLevel": "HIGH"
    }
  },
  "safetySettings": [
    { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" },
    { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
    { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH" },
    { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH" }
  ]
}
```

#### 🎯 Parâmetros de Geração

| Parâmetro | Valor | Descrição |
|---|---|---|
| **thinkingLevel** | "HIGH" | Modo thinking de raciocínio profundo |
| **temperature** | (padrão) | Não especificado — usa padrão da API (~0.7) |
| **topK** | (padrão) | Não especificado |
| **topP** | (padrão) | Não especificado |
| **maxTokens** | (padrão) | Não especificado |

#### 🛡️ Segurança & Safety Settings

| Categoria | Threshold | Justificativa |
|---|---|---|
| `HARM_CATEGORY_DANGEROUS_CONTENT` | BLOCK_NONE | Análises esotéricas requerem liberdade de expressão |
| `HARM_CATEGORY_HARASSMENT` | BLOCK_NONE | Interpretações pessoais + feedback sem mediação |
| `HARM_CATEGORY_HATE_SPEECH` | BLOCK_ONLY_HIGH | Bloqueio apenas em violações severas |
| `HARM_CATEGORY_SEXUALLY_EXPLICIT` | BLOCK_ONLY_HIGH | Bloqueio apenas em explicitação severa |

#### 📝 Prompt de Sistema Completo

**Linhas: 73-85**

```
Atue como um Mestre Iniciador da Umbanda Esotérica da Raiz de Guiné e Psicanalista Junguiano.
Dados calculados astrologicamente: {dadosAnalise} do consulente: {query}

O aplicativo exibe ao usuário uma jornada narrativa de choque de realidade: PRIMEIRO apresentamos a Astrologia Tropical (12 signos) como a máscara terrena/Ego, e DEPOIS a Astrologia Astronômica Constelacional (13 signos) como a verdade estelar oculta/Alma.
Siga EXATAMENTE esta mesma ordem! Faça DUAS análises profundas e separadas:
1º. Astrologia Tropical (A Persona)
2º. Astrologia Astronômica (A Essência da Alma)
Integre a Astrologia, a Umbanda Esotérica da Raiz de Guiné de W. W. da Matta e Silva, os Tatwas e a Psicologia Analítica de C. G. Jung. Ao final, efetue uma síntese conjunta comparativa.

ATENÇÃO RIGOROSA 1: Analise a influência do "Astro" (o 6º card da Umbanda, que representa a Hora Planetária do minuto exato baseada na Sequência dos Caldeus) e sua sinergia com o Orixá regente.
ATENÇÃO RIGOROSA 2: Inclua de forma explícita e obrigatória a informação de que a Coroa calculada via data de nascimento serve para revelar a Vibração Original "Teórica/Magnética". Informe claramente que, por necessidades e cobranças cármicas de encarnação, a entidade que atua "de frente" pode pertencer a outra Linha, e que a verdadeira coroa e guias de frente só podem ser atestados de forma inequívoca e prática no terreiro através da "Lei de Pemba" e pelo Mestre de Iniciação.

Retorne APENAS HTML formatado em <p>, <strong>, <ul>, <li>. Sem marcações markdown ou blocos de código e com os títulos alinhados à esquerda e os textos dos parágrafos justificados e com recuo de primeira linha de cada parágrafo.

USE OBRIGATORIAMENTE emojis e símbolos pictóricos Unicode ao longo de todo o texto: símbolos dos astros e planetas (☀️🌙⭐✨🪐💫🌟), dos signos do zodíaco (♈♉♊♋♌♍♎♏♐♑♒♓⛎), dos Orixás e entidades (⚔️🌊🔥🌿🌪️⚡🏹🌹🕯️💀🌺), de elementos esotéricos e místicos (🔮🧿📿☯️🌀🗝️🌑🌕), além de outros símbolos de reforço narrativo (🧠💡⚖️🌐🔗💎🛡️). Coloque-os no início dos títulos e seções, e intercale-os nos parágrafos para enriquecer a leitura e destacar conceitos-chave.
```

**Contexto Incluído no Prompt:**
- `dadosAnalise`: JSON completo com sistemas Tropical + Astronômico
- `query`: Nome, localização e data/hora de nascimento do consulente
- `dadosTropical`, `dadosAstronomica`, `dadosGlobais`: Estruturas de dados calculadas

#### 💾 Processamento de Resposta (linhas 103-117)

```typescript
const aiData = await response.json() as Record<string, unknown>;
const candidates = aiData?.candidates as Array<Record<string, unknown>>;
const content = candidates?.[0]?.content as Record<string, unknown>;
const parts = content?.parts as Array<Record<string, string | boolean>>;
// Filtrar partes visíveis (ignorar thoughts de modelos thinking)
const visibleParts = (parts || []).filter(p => p.text && !p.thought);
let analise = visibleParts.map(p => p.text).join('') || parts?.[0]?.text as string || "<p>Perturbação no éter na geração.</p>";
analise = sanitizeGeneratedHtml(analise);
if (!analise) analise = "<p>Perturbação no éter na geração.</p>";
```

**Fluxo:**
1. Parse da resposta JSON da API
2. Extração de `candidates[0].content.parts[]`
3. Filtragem de partes visíveis (exclui `.thought` do thinking mode)
4. Sanitização de HTML (remove scripts, estilos, event handlers)
5. Fallback para mensagem de erro se vazio

#### ⚖️ Rate Limiting

```typescript
const RATE_LIMIT = { route: 'analisar', limit: 6, windowMs: 15 * 60 * 1000 };
```

| Métrica | Valor |
|---|---|
| **Limite** | 6 requisições |
| **Janela de Tempo** | 15 minutos (900s) |
| **Aplicado em** | Linha 42 (resolveRateLimitConfig + enforceRateLimit) |
| **Status HTTP se Limitado** | 429 (Too Many Requests) |

#### 🔄 Retry Strategy

```typescript
for (let t = 0; t < 2; t++) {
  response = await fetch(/* ... */);
  if (response!.ok) break;
  if (t === 0) await new Promise(r => setTimeout(r, 800));
}
```

- **Tentativas:** 2 (1 tentativa + 1 retry)
- **Delay entre Tentativas:** 800ms
- **Aplicado em:** Linha 88-96
- **Dispara em:** Qualquer falha HTTP (ex: 429, 502, 503)

#### ⛔ Tratamento de Erros

| Situação | Status HTTP | Mensagem |
|---|---|---|
| Origem não permitida | 403 | "Origem não permitida." |
| Rate limit excedido | 429 | "Muitas análises em sequência. Aguarde antes de solicitar outra." |
| Dados insuficientes | 400 | "Dados insuficientes para análise." |
| API Gemini falhando | 502 | "Falha no provedor de IA." |
| Erro geral | 500 | "Falha na comunicação Cósmica." |

#### 💾 Persistência em Banco de Dados

```typescript
if (env.DB && id && typeof id === 'string') {
  try { 
    await env.DB.prepare("UPDATE mapas_astrologicos SET analise_ia = ? WHERE id = ?")
      .bind(analise, id).run(); 
  }
  catch { console.warn("Erro silencioso ao atualizar análise no banco."); }
}
```

- **Tabela:** `mapas_astrologicos`
- **Coluna:** `analise_ia` (HTML sanitizado)
- **Tipo:** Cloudflare D1 (SQLite)
- **Erro Tratado:** Silenciosamente (log apenas)

---

### 2️⃣ **astrologo-frontend/functions/api/calcular.ts**
**Status:** ✅ Sem dependência direta de IA

| Propriedade | Valor |
|---|---|
| **Caminho** | `astrologo-app/astrologo-frontend/functions/api/calcular.ts` |
| **Versão** | v02.14.00 |
| **Descrição** | Cálculo astrométrico: posições de astros, signos, Tatwas, numerologia; comunica com Open-Meteo (geolocalização e astronomia) |
| **IA Envolvida** | ❌ Nenhuma — apenas aritmética e APIs astronômicas |

**Nota:** Arquivo mencionado aqui por contexto. No analisador de IA, não contém integrações com Gemini ou outros modelos.

---

### 3️⃣ **astrologo-frontend/src/App.tsx**
**Status:** ✅ Orquestração das chamadas

| Propriedade | Valor |
|---|---|
| **Caminho** | `astrologo-app/astrologo-frontend/src/App.tsx` |
| **Versão** | v02.15.00 |
| **Descrição** | Frontend principal que invoca análise astrológica |

#### Chamada à API de Análise (linha 449)

```typescript
const res = await fetch('/api/analisar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: result.id,
    dadosAstronomica: result.dadosAstronomica,
    dadosTropical: result.dadosTropical,
    dadosGlobais: result.dadosGlobais,
    query: result.query
  })
});
```

**Fluxo:**
1. Usuário preenche formulário (nome, data/hora/local de nascimento)
2. Clica "Calcular" → chamada a `/api/calcular`
3. Resultado é exibido com dados astrológicos
4. Usuário clica "Solicitar Análise por IA"
5. Chamada a `/api/analisar` com dados do mapa calculado
6. HTML gerado pelo Gemini é renderizado com `DOMPurify`

#### Sanitização no Frontend (linha 13)

```typescript
const sanitizeRichHtml = (html: string): string => DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['p', 'strong', 'ul', 'li', 'em', 'b', 'i', 'h1', 'h2', 'h3', 'br'],
  ALLOWED_ATTR: []
});
```

**Tags Permitidas:**
- `p`, `strong`, `ul`, `li` — estrutura de conteúdo
- `em`, `b`, `i` — ênfase textual
- `h1`, `h2`, `h3` — cabeçalhos
- `br` — quebras de linha

**Atributos Bloqueados:** Nenhum atributo é permitido (segurança contra XSS)

---

### 4️⃣ **Arquivos de Configuração & Ambiente**

#### `.env` (raiz do projeto)
```env
GEMINI_API_KEY=__PREENCHER_GEMINI_API_KEY__
```
- **Linha:** 5
- **Status:** Placeholder em exemplo
- **Produção:** Token real armazenado em Cloudflare Secrets

---

### 5️⃣ ** Arquivo CHANGELOG**
**Caminho:** `astrologo-app/astrologo-frontend/CHANGELOG.md`

**Ultimaa Atualização (v02.15.00):**
```
### Corrigido
- Reinserção obrigatória de emojis e símbolos pictóricos (astros, signos, orixás, esotérico) no prompt da IA, que haviam desaparecido após o upgrade do modelo Gemini
```

**Versão Anterior (v02.14.00):**
```
### Alterado
- Upgrade Gemini API: modelo gemini-pro-latest, endpoint v1beta, thinkingLevel HIGH, safetySettings, retry
```

---

## 🔐 Segurança & Configuração de Headers

### Content-Security-Policy (CSP)
**Arquivo:** `astrologo-frontend/public/_headers`

```http
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; 
  connect-src 'self' https://*.lcv.app.br https://api.resend.com https://generativelanguage.googleapis.com https://geocoding-api.open-meteo.com https://cloudflareinsights.com;
  ...
```

**Permissões Relevantes para Gemini:**
- `connect-src https://generativelanguage.googleapis.com` — permite fetch() para Google Gemini API
- Domínio completo whitelisted (não wildcard)

---

## 📍 Mapa Visual de Fluxo

```
┌──────────────────┐
│   Usuário        │
│   (Frontend)     │
└────────┬─────────┘
         │
         │ POST /api/calcular
         ▼
┌────────────────────┐
│  calcular.ts       │ ← Preparação de dados astrométricos
│  (sem IA)          │   + Open-Meteo (geocoding, sunrise/sunset)
└────────┬───────────┘
         │
         │ Resultado com dados Tropical/Astronômico
         ▼
┌────────────────────┐
│   App.tsx          │ ← Exibe mapas calculados
│   (Display)        │   + Botão "Solicitar Análise IA"
└────────┬───────────┘
         │
         │ POST /api/analisar (dados + prompt)
         ▼
┌──────────────────────────────────┐
│    analisar.ts                   │
│    ┌────────────────────────┐    │
│    │ Complementar Dados    │    │  ← Rate Limit Check
│    │ + Prompt Injection    │    │
│    └────────────┬───────────┘    │
│                 │                │
│                 ▼                │
│    ┌────────────────────────┐    │
│    │ fetch() to:            │    │
│    │ generativelanguage..   │    │  ← Google Gemini v1beta
│    │ /generateContent       │    │
│    │ (thinkingLevel: HIGH)  │    │
│    │ (safetySettings: [...])│    │
│    │ (retry: 2x)            │    │
│    └────────────┬───────────┘    │
│                 │                │
│                 ▼                │
│    ┌────────────────────────┐    │
│    │ Sanitize HTML          │    │  ← Remove <script>, etc
│    │ Store in D1            │    │
│    └────────────┬───────────┘    │
└────────────────┼──────────────────┘
                 │
                 │ REST Response (HTML)
                 ▼
┌────────────────────┐
│   App.tsx          │ ← DOMPurify (frontend)
│   (Display)        │   + Render síntese do Mestre
└────────────────────┘
```

---

## 📊 Estatísticas & Métricas

| Métrica | Valor |
|---|---|
| **Total de Linhas com IA** | ~150 (analisar.ts) |
| **Endpoints com Depedência de Gemini** | 1 (/api/analisar) |
| **Modelos de IA Utilizados** | 1 (gemini-pro-latest) |
| **Recursos de IA Ativos** | 2 (inference, thinking mode) |
| **Rate Limit (analisar)** | 6 req/15min |
| **Versão da API** | v1beta |
| **Safety Categories** | 4 |
| **Retry Automático** | Sim (2 tentativas, 800ms delay) |
| **Armazenamento de Análises** | D1 (coluna: analise_ia) |
| **Sanitização** | DOMPurify (frontend) + custom (backend) |

---

## 🚨 Observações Críticas

### ✅ Pontos Positivos
1. **Thinking Mode Ativo** — Raciocínio profundo (thinkingLevel: HIGH) apropriado para análises complexas
2. **Retry Automático** — Tratamento de falhas transitórias com backoff de 800ms
3. **Safety Settings Customizados** — Bloqueios apenas em violações severas, adequado para contexto esotérico
4. **Rate Limiting** — Proteção contra abuso (6 req/15min)
5. **Sanitização Dupla** — Backend (custom) + Frontend (DOMPurify)
6. **Persistência em D1** — Análises armazenadas com ID único para rastreamento

### ⚠️ Pontos de Atenção
1. **Prompt Longo & Complexo** — 400+ tokens de system prompt; considerar compressão semântica
2. **Safety Settings Relaxados** — BLOCK_NONE para DANGEROUS_CONTENT e HARASSMENT; avaliar necessidade
3. **Sem Versionamento de Modelo** — gemini-pro-latest é dinâmico; mudanças podem ocorrer sem notice prévio
   - **Recomendação:** Considerar pinned version (ex: gemini-2.5-pro ou gemini-1.5-pro) para estabilidade
4. **Thinking Mode Premium** — thinkingLevel: HIGH consome mais tokens; verificar custo-benefício
5. **Sem Logging Estruturado** — Erros silenciosos em algumas catch blocks
6. **Tokens não Limitados** — Nenhum maxTokens especificado; respostas podem ser longas (custo variável)

---

## 🔄 Histórico de Upgrades

| Versão | Data | Mudança |
|---|---|---|
| v02.15.00 | 23/03/2026 | ✅ Fixing: Reinserção de emojis no prompt |
| v02.14.00 | 22/03/2026 | ✅ Upgrade: gemini-pro-latest + v1beta + thinkingLevel HIGH + safetySettings + retry |
| v02.13.00 | Anterior | ❓ Versão sem padronização |

---

## 📚 Referências & URLs

### API Oficial
- **Google Gemini API Docs:** https://ai.google.dev/docs
- **Endpoint v1beta:** https://generativelanguage.googleapis.com/v1beta/
- **Models Disponíveis:** https://ai.google.dev/models

### Segurança
- **DOMPurify:** https://github.com/cure53/DOMPurify
- **Content-Security-Policy:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

### Infraestrutura (Astrólogo-App)
- **Frontend:** Vite + React + TypeScript
- **Backend:** Cloudflare Workers + D1 (SQLite)
- **Deployé em:** Cloudflare Pages + Workers
- **Database:** D1 (bigdata_db)

---

## ✅ Conclusão

**Status de Compliance:** ✅ **AUDITADO COM SUCESSO**

A integração de IA no astrologo-app está **bem implementada** e **tecnicamente sólida**. O uso de `gemini-pro-latest` com `thinkingLevel: HIGH` é apropriado para análises esotéricas complexas. Recomenda-se monitorar custo de uso (prompt longo + thinking mode premium) e considerar consolidação de alguns safety settings em futuras iterações.

---

**Auditado por:** GitHub Copilot (Claude Haiku 4.5)  
**Data:** 23/03/2026  
**Próxima Revisão Recomendada:** 30/06/2026 (trimestral)
