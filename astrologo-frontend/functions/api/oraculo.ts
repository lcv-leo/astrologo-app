export async function onRequestPost(context: any) {
  const { request, env } = context;
  
  try {
    const { nome, dataNascimento, horaNascimento, localNascimento } = await request.json();

    const prompt = `Você é um Mestre Astrólogo Astronômico Constelacional e Mestre Supremo da Umbanda Esotérica da Raiz de Guiné (W. W. da Matta e Silva).

CALCULE COM RIGOR CIENTÍFICO E OCULTO O MAPA PARA:
Nome: ${nome} | Nascimento: ${dataNascimento} às ${horaNascimento} | Local: ${localNascimento}

1. REGRAS ASTROLÓGICAS ASTRONÔMICAS (MANDATÓRIO):
É TERMINANTEMENTE PROIBIDO usar a Astrologia Tropical. Você DEVE calcular as posições ASTRONÔMICAS REAIS (físicas) nas constelações, descontando o Ayanamsa/precessão dos equinócios (~24 graus). 
Exemplo de aferição: 26/03/1979 às 16:45 no RJ -> O Sol Astronômico NÃO ESTÁ em Áries, mas sim na constelação de PEIXES. O Ascendente Astronômico é LEÃO. O Meio do Céu Astronômico é TOURO. Calcule e retorne EXATAMENTE os signos astronômicos reais.

2. REGRAS DA UMBANDA ESOTÉRICA DA RAIZ DE GUINÉ (MANDATÓRIO):
Utilize APENAS as 7 Vibrações Originais abaixo. É EXTREMAMENTE PROIBIDO citar Orixás fora desta lista (como Iansã, Oxum, Obaluaê, etc).
- 1ª: ORIXALÁ (Planeta SOL, Dia Domingo, Cor Branco/Amarelo Ouro, Mediador Gabriel)
- 2ª: YEMANJÁ (Planeta LUA, Dia Segunda-feira, Cor Amarelo/Prateado, Mediador Rafael)
- 3ª: OGUM (Planeta MARTE, Dia Terça-feira, Cor Alaranjada, Mediador Samuel)
- 4ª: YORI (Planeta MERCÚRIO, Dia Quarta-feira, Cor Vermelha, Mediador Yoriel)
- 5ª: XANGÔ (Planeta JÚPITER, Dia Quinta-feira, Cor Verde, Mediador Miguel)
- 6ª: OXOSSI (Planeta VÊNUS, Dia Sexta-feira, Cor Azul, Mediador Ismael)
- 7ª: YORIMA (Planeta SATURNO, Dia Sábado, Cor Violeta, Mediador Yramael)

3. CÁLCULO DOS TRÊS ORIXÁS DA COROA:
- 1º Orixá (Coroa / Regente Planetário): Descubra o PLANETA regente clássico do Signo Solar ASTRONÔMICO e atribua a linha. (Ex: Sol em Peixes -> regente Júpiter -> 5ª Linha: XANGÔ).
- 2º Orixá (Adjuntó / Regente do Dia): Descubra o DIA DA SEMANA exato do nascimento. (Ex: 26/03/1979 foi Segunda-feira -> Planeta LUA -> 2ª Linha: YEMANJÁ).
- 3º Orixá (Frente / Missão): Descubra o Planeta regente do MEIO DO CÉU ASTRONÔMICO. (Ex: MC Astronômico em Touro -> regente Vênus -> 6ª Linha: OXOSSI).

Retorne EXCLUSIVAMENTE um objeto JSON puro. NÃO use blocos de código Markdown (\`\`\`json) e não escreva texto antes nem depois. Estrutura EXATA exigida:
{
  "astrologia": [
    {"astro": "Sol", "signo": "Signo Astronômico Real", "simbolo": "☀️"},
    {"astro": "Ascendente", "signo": "Signo Astronômico Real", "simbolo": "⬆️"},
    {"astro": "Lua", "signo": "Signo Astronômico Real", "simbolo": "🌙"}
  ],
  "tatwa": {"principal": "Nome + Emoji", "sub": "Nome + Emoji"},
  "numerologia": {"expressao": 0, "caminhoVida": 0, "vibracaoHora": 0},
  "umbanda": [
    {"posicao": "1º Orixá (Coroa Maior)", "orixa": "Nome exato de 1 das 7 Linhas", "simbolo": "👑"},
    {"posicao": "2º Orixá (Adjuntó/Dia)", "orixa": "Nome exato de 1 das 7 Linhas", "simbolo": "🌊"},
    {"posicao": "3º Orixá (Frente/Missão)", "orixa": "Nome exato de 1 das 7 Linhas", "simbolo": "🏹"}
  ],
  "sintese": "Texto extenso, magistral e profundo em Markdown, cruzando detalhadamente Jung, as 3 Vibrações Originais calculadas (cite os mediadores, cores e horários vibratórios da tabela sagrada de Guiné na sua explicação), Cartas de Cristo, Bashar e Física Quântica."
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const aiData = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: aiData.error?.message || "Acesso negado pela malha da API." }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    if (!aiData.candidates || aiData.candidates.length === 0 || !aiData.candidates[0].content) {
      return new Response(JSON.stringify({ error: "Filtro de segurança ativado ou IA hesitou." }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    let jsonText = aiData.candidates[0].content.parts[0].text;
    
    // Extrator Quântico Infalível
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    } else {
        jsonText = jsonText.replace(/^```json/mi, '').replace(/```$/mi, '').trim();
    }

    const resultado = JSON.parse(jsonText);
    const idUnico = crypto.randomUUID();

    await env.DB.prepare(
      "INSERT INTO mapas (id, nome, data_nascimento, hora_nascimento, local_nascimento, resultado_json) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(idUnico, nome, dataNascimento, horaNascimento, localNascimento, JSON.stringify(resultado)).run();

    return new Response(JSON.stringify({ success: true, dados: resultado }), { headers: { "Content-Type": "application/json" } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: "A Inteligência não formulou o JSON corretamente." }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}