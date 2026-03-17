export async function onRequestPost(context: any) {
  const { request, env } = context;
  
  try {
    const { id, nome, dados } = await request.json();

    const prompt = `Você é um Mestre da Síntese Oculta. Escreva uma profunda Síntese Multidimensional para ${nome}, baseando-se EXATAMENTE nestes dados matemáticos infalíveis:
${JSON.stringify(dados)}

CRUZAMENTOS OBRIGATÓRIOS:
1. Psicologia Analítica de C.G. Jung (Individuação e Sombras).
2. A Umbanda Esotérica da Raiz de Guiné (W. W. da Matta e Silva): Explore as 3 Vibrações Originais que já foram calculadas nos dados. Não altere as linhas. Cite as cores, horários vibratórios e os mediadores angélicos dessas 3 linhas de acordo com o JSON enviado.
3. As Cartas de Cristo e a Física Quântica / Bashar.

Escreva o texto final formatado em Markdown cru, sem usar blocos de código (\`\`\`markdown).`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const aiData = await response.json();
    if (!response.ok) throw new Error("A IA falhou em formular a síntese.");

    let textoSintese = aiData.candidates[0].content.parts[0].text;
    textoSintese = textoSintese.replace(/^```markdown/mi, '').replace(/```$/mi, '').trim();

    // Atualiza o banco adicionando a síntese
    const dadosCompletos = { ...dados, sintese: textoSintese };
    await env.DB.prepare("UPDATE mapas SET resultado_json = ? WHERE id = ?").bind(JSON.stringify(dadosCompletos), id).run();

    return new Response(JSON.stringify({ success: true, sintese: textoSintese }), { headers: { "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: "Distúrbio na Inteligência Sintética." }), { status: 500 });
  }
}