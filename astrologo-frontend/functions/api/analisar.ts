export async function onRequestPost(context: any) {
  const { request, env } = context;
  try {
    const { id, dadosAstronomica, dadosTropical, dadosGlobais, query } = await request.json();

    const dadosAnalise = `Sistema Tropical: ${JSON.stringify(dadosTropical)} | Sistema Astronômico Constelacional: ${JSON.stringify(dadosAstronomica)} | Globais (Tatwas e Numerologia): ${JSON.stringify(dadosGlobais)}`;

    const prompt = `Atue como um Mestre Iniciador da Umbanda Esotérica da Raiz de Guiné e Psicanalista Junguiano.
Dados calculados astrologicamente: ${dadosAnalise} do consulente: ${JSON.stringify(query)}

O aplicativo exibe ao usuário uma jornada narrativa de choque de realidade: PRIMEIRO apresentamos a Astrologia Tropical (12 signos) como a máscara terrena/Ego, e DEPOIS a Astrologia Astronômica Constelacional (13 signos) como a verdade estelar oculta/Alma.
Siga EXATAMENTE esta mesma ordem! Faça DUAS análises profundas e separadas:
1º. Astrologia Tropical (A Persona)
2º. Astrologia Astronômica (A Essência da Alma)
Integre a Astrologia, a Umbanda Esotérica da Raiz de Guiné de W. W. da Matta e Silva, os Tatwas e a Psicologia Analítica de C. G. Jung. Ao final, efetue uma síntese conjunta comparativa.

ATENÇÃO RIGOROSA 1: Analise a influência do "Astro" (o 6º card da Umbanda, que representa a Hora Planetária do minuto exato baseada na Sequência dos Caldeus) e sua sinergia com o Orixá regente.
ATENÇÃO RIGOROSA 2: Inclua de forma explícita e obrigatória a informação de que a Coroa calculada via data de nascimento serve para revelar a Vibração Original "Teórica/Magnética". Informe claramente que, por necessidades e cobranças cármicas de encarnação, a entidade que atua "de frente" pode pertencer a outra Linha, e que a verdadeira coroa e guias de frente só podem ser atestados de forma inequívoca e prática no terreiro através da "Lei de Pemba" (sinais riscados com Flecha, Chave e Raiz) e pelo Mestre de Iniciação.

Retorne APENAS HTML formatado em <p>, <strong>, <ul>, <li>. Sem marcações markdown ou blocos de código e com os títulos alinhados à esquerda e os textos dos parágrafos justificados e com recuo de primeira linha de cada parágrafo.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const aiData = await response.json();
    let analise = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || "<p>Perturbação no éter na geração.</p>";
    analise = analise.replace(/```html/g, '').replace(/```/g, '');

    if (env.DB && id) {
      try { await env.DB.prepare("UPDATE mapas_astrologicos SET analise_ia = ? WHERE id = ?").bind(analise, id).run(); }
      catch (dbError) { console.log("Erro silencioso ao atualizar análise no banco."); }
    }

    return new Response(JSON.stringify({ success: true, analise }), { headers: { "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: "Falha na comunicação Cósmica." }), { status: 500 });
  }
}