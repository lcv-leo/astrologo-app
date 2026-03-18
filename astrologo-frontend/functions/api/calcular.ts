export async function onRequestPost(context: any) {
    const { request, env } = context;

    try {
        const { nome, dataNascimento, horaNascimento, localNascimento } = await request.json();

        const tz = -3;

        const prompt = `Retorne APENAS um JSON com lat, lon, sunrise e sunset de "${localNascimento}" no dia ${dataNascimento} considerando o fuso horário oficial de Brasília (UTC-3). Ex: {"lat":-22.9068,"lon":-43.1729,"sunrise":"06:05","sunset":"18:15"}`;
        let lat = -22.9068, lon = -43.1729, srH = 6, srM = 5, ssH = 18, ssM = 0;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${env.GEMINI_API_KEY}`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const aiData = await response.json();
            let jsonText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
            const match = jsonText.match(/\{[\s\S]*\}/);
            if (match) {
                const geo = JSON.parse(match[0]);
                lat = parseFloat(geo.lat) || lat; lon = parseFloat(geo.lon) || lon;
                const srSplit = (geo.sunrise || "06:05").split(':').map(Number); srH = srSplit[0]; srM = srSplit[1];
                const ssSplit = (geo.sunset || "18:00").split(':').map(Number); ssH = ssSplit[0]; ssM = ssSplit[1];
            }
        } catch (e) { console.log("Fallback Geográfico."); }

        const [ano, mes, dia] = dataNascimento.split('-').map(Number);
        const [hLocal, mLocal] = horaNascimento.split(':').map(Number);

        let utcHour = hLocal - tz; let utcDay = dia;
        if (utcHour >= 24) { utcHour -= 24; utcDay += 1; } else if (utcHour < 0) { utcHour += 24; utcDay -= 1; }

        const getJd = (y: number, m: number, d: number, h: number, min: number) => {
            if (m <= 2) { y -= 1; m += 12; }
            const A = Math.floor(y / 100); const B = 2 - A + Math.floor(A / 4);
            return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + (h + min / 60) / 24 + B - 1524.5;
        };

        const j_date = getJd(ano, mes, utcDay, utcHour, mLocal);
        const T = (j_date - 2451545.0) / 36525.0;
        const wrap = (deg: number) => (deg % 360 + 360) % 360;
        const rad = Math.PI / 180;

        const L0 = wrap(280.46646 + 36000.76983 * T);
        const M = wrap(357.52911 + 35999.05029 * T);
        const sunLon = wrap(L0 + 1.914602 * Math.sin(M * rad) + 0.019993 * Math.sin(2 * M * rad));

        const L_moon = wrap(218.316 + 481267.881 * T);
        const D = wrap(297.850 + 445267.111 * T);
        const M_moon = wrap(134.963 + 477198.867 * T);
        const moonLon = wrap(L_moon + 6.289 * Math.sin(M_moon * rad) - 1.274 * Math.sin((M_moon - 2 * D) * rad));

        const th0 = wrap(280.46061837 + 360.98564736629 * (j_date - 2451545.0) + 0.000387933 * T * T);
        const local_sidereal = wrap(th0 + lon);
        const eps = 23.43929111 - 0.013004167 * T;

        const mcLon = wrap(Math.atan2(Math.sin(local_sidereal * rad), Math.cos(local_sidereal * rad) * Math.cos(eps * rad)) / rad);
        const ascLon = wrap(Math.atan2(Math.cos(local_sidereal * rad), -(Math.sin(local_sidereal * rad) * Math.cos(eps * rad) + Math.tan(lat * rad) * Math.sin(eps * rad))) / rad);

        const signosTropicais = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
        const getTropicalInfo = (lon: number) => {
            const idx = Math.floor(wrap(lon) / 30);
            const decanato = Math.floor((wrap(lon) % 30) / 10);
            return { nome: signosTropicais[idx], decanato: decanato > 2 ? 2 : decanato };
        };

        const IAU_BORDERS = [
            { nome: "Peixes", inicio: 351.5, fim: 29.3 }, { nome: "Áries", inicio: 29.3, fim: 53.5 },
            { nome: "Touro", inicio: 53.5, fim: 90.2 }, { nome: "Gêmeos", inicio: 90.2, fim: 118.4 },
            { nome: "Câncer", inicio: 118.4, fim: 138.2 }, { nome: "Leão", inicio: 138.2, fim: 173.9 },
            { nome: "Virgem", inicio: 173.9, fim: 218.0 }, { nome: "Libra", inicio: 218.0, fim: 241.0 },
            { nome: "Escorpião", inicio: 241.0, fim: 247.7 }, { nome: "Ophiuchus", inicio: 247.7, fim: 266.3 },
            { nome: "Sagitário", inicio: 266.3, fim: 299.7 }, { nome: "Capricórnio", inicio: 299.7, fim: 327.6 },
            { nome: "Aquário", inicio: 327.6, fim: 351.5 }
        ];
        const getIauInfo = (tropicalLon: number) => {
            const shift = (ano - 2000) * (50.29 / 3600);
            const j2000Lon = wrap(tropicalLon - shift);
            let found = IAU_BORDERS[0];
            for (const b of IAU_BORDERS) {
                if (b.inicio > b.fim) { if (j2000Lon >= b.inicio || j2000Lon < b.fim) { found = b; break; } }
                else { if (j2000Lon >= b.inicio && j2000Lon < b.fim) { found = b; break; } }
            }
            let width = wrap(found.fim - found.inicio); if (width === 0) width = 360;
            let progress = wrap(j2000Lon - found.inicio);
            let decanIndex = Math.floor((progress / width) * 3);
            if (decanIndex > 2) decanIndex = 2;
            return { nome: found.nome, decanato: decanIndex };
        };

        const tabelaV: Record<string, string[]> = {
            "Leão": ["Orixalá", "Xangô", "Ogum"], "Áries": ["Ogum", "Orixalá", "Xangô"], "Escorpião": ["Ogum", "Xangô", "Yemanjá"],
            "Touro": ["Oxossi", "Yori", "Yorimá"], "Libra": ["Oxossi", "Yorimá", "Yori"], "Sagitário": ["Xangô", "Ogum", "Orixalá"],
            "Peixes": ["Xangô", "Yemanjá", "Ogum"], "Capricórnio": ["Yorimá", "Oxossi", "Yori"], "Aquário": ["Yorimá", "Yori", "Oxossi"],
            "Gêmeos": ["Yori", "Oxossi", "Yorimá"], "Virgem": ["Yori", "Yorimá", "Oxossi"], "Câncer": ["Yemanjá", "Ogum", "Xangô"],
            "Ophiuchus": ["Ogum", "Xangô", "Yemanjá"]
        };

        const getOrixaHora = (h: number) => {
            if (h >= 3 && h < 6) return "Ogum"; if (h >= 6 && h < 9) return "Oxossi";
            if (h >= 9 && h < 12) return "Orixalá"; if (h >= 12 && h < 15) return "Yori";
            if (h >= 15 && h < 18) return "Xangô"; if (h >= 18 && h < 21) return "Yemanjá";
            if (h >= 21 && h < 24) return "Yorimá"; return "Exu";
        };

        const dataLocalObj = new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0));
        let diaDaSemanaIdx = dataLocalObj.getUTCDay();

        const orixasVibracaoMap = ["Orixalá", "Yemanjá", "Ogum", "Yori", "Xangô", "Oxossi", "Yorimá"];
        const orixaDia = orixasVibracaoMap[diaDaSemanaIdx];
        const orixaHora = getOrixaHora(hLocal + (mLocal / 60));

        const getPlanetaryHour = () => {
            const bMins = hLocal * 60 + mLocal;
            const srMins = srH * 60 + srM;
            const ssMins = ssH * 60 + ssM;

            let isDay = false; let dayOfWeekAstrological = diaDaSemanaIdx;
            let minsFromStart = 0; let periodDurationMins = 0;

            if (bMins >= srMins && bMins < ssMins) {
                isDay = true; minsFromStart = bMins - srMins; periodDurationMins = ssMins - srMins;
            } else {
                isDay = false;
                if (bMins < srMins) {
                    dayOfWeekAstrological = (diaDaSemanaIdx + 6) % 7;
                    minsFromStart = (bMins + 1440) - ssMins; periodDurationMins = 1440 - ssMins + srMins;
                } else {
                    minsFromStart = bMins - ssMins; periodDurationMins = 1440 - ssMins + srMins;
                }
            }

            let hourLength = periodDurationMins / 12; if (hourLength === 0) hourLength = 60;

            const hourIndex = Math.floor(minsFromStart / hourLength);
            const chaldean = ["Saturno", "Júpiter", "Marte", "Sol", "Vênus", "Mercúrio", "Lua"];
            const dayRulerPlanets = ["Sol", "Lua", "Marte", "Mercúrio", "Júpiter", "Vênus", "Saturno"];

            const rulerOfDay = dayRulerPlanets[dayOfWeekAstrological];
            const startIndex = chaldean.indexOf(rulerOfDay);

            const totalHoursPassed = isDay ? hourIndex : 12 + hourIndex;
            const currentPlanetIndex = (startIndex + totalHoursPassed) % 7;

            return chaldean[currentPlanetIndex];
        };

        const planetaRegenteHora = getPlanetaryHour();
        const planetaParaOrixa: Record<string, string> = { "Sol": "Orixalá", "Lua": "Yemanjá", "Marte": "Ogum", "Mercúrio": "Yori", "Júpiter": "Xangô", "Vênus": "Oxóssi", "Saturno": "Yorimá" };
        const orixaHoraPlanetaria = planetaParaOrixa[planetaRegenteHora] || "Orixalá";
        const planetaSimbolos: Record<string, string> = { "Sol": "☀️", "Lua": "🌙", "Marte": "♂️", "Mercúrio": "☿️", "Júpiter": "♃", "Vênus": "♀️", "Saturno": "♄" };

        const gerarDadosSistema = (infoSol: any, infoLua: any, infoAsc: any, infoMc: any) => {
            const orixaCoroa = tabelaV[infoSol.nome]?.[0] || "Orixalá";
            const orixaFrente = tabelaV[infoMc.nome]?.[0] || "Orixalá";
            const orixaDecanato = tabelaV[infoSol.nome]?.[infoSol.decanato] || "Orixalá";

            return {
                astrologia: [
                    { astro: "Sol", signo: infoSol.nome, simbolo: "☀️" }, { astro: "Ascendente", signo: infoAsc.nome, simbolo: "⬆️" },
                    { astro: "Lua", signo: infoLua.nome, simbolo: "🌙" }, { astro: "Meio do Céu", signo: infoMc.nome, simbolo: "🔭" }
                ],
                umbanda: [
                    { posicao: "Coroa (1º)", orixa: orixaCoroa.toUpperCase(), simbolo: "👑" }, { posicao: "Adjuntó (2º)", orixa: orixaDia.toUpperCase(), simbolo: "🌊" },
                    { posicao: "Frente (3º)", orixa: orixaFrente.toUpperCase(), simbolo: "🏹" }, { posicao: `Decanato (${infoSol.decanato + 1}º)`, orixa: orixaDecanato.toUpperCase(), simbolo: "🌟" },
                    { posicao: "Faixa (3h)", orixa: orixaHora.toUpperCase(), simbolo: "⏳" }, { posicao: `Astro (${planetaRegenteHora})`, orixa: orixaHoraPlanetaria.toUpperCase(), simbolo: planetaSimbolos[planetaRegenteHora] }
                ]
            };
        };

        let minsFromSunrise = Math.round((hLocal * 60 + mLocal) - (srH * 60 + srM));
        if (minsFromSunrise < 0) minsFromSunrise += 1440;
        const tattwas = ["Akasha (Éter)", "Vayu (Ar)", "Tejas (Fogo)", "Apas (Água)", "Prithvi (Terra)"];
        const mainIdx = Math.floor(minsFromSunrise / 24) % 5;
        const subIdx = (mainIdx + Math.floor((minsFromSunrise % 24) / 4.8)) % 5;

        const reduceNum = (n: number | string) => {
            let sum = String(n).replace(/\D/g, '').split('').reduce((a, b) => a + parseInt(b), 0);
            while (sum > 9 && ![11, 22, 33].includes(sum)) sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
            return sum;
        };
        const calcExp = (str: string) => {
            let sum = 0; const map: Record<string, number> = { a: 1, j: 1, s: 1, b: 2, k: 2, t: 2, c: 3, l: 3, u: 3, d: 4, m: 4, v: 4, e: 5, n: 5, w: 5, f: 6, o: 6, x: 6, g: 7, p: 7, y: 7, h: 8, q: 8, z: 8, i: 9, r: 9 };
            str.toLowerCase().normalize("NFD").replace(/[^a-z\s]/g, "").split(/\s+/).forEach(w => { let wSum = 0; for (let c of w) if (map[c]) wSum += map[c]; sum += reduceNum(wSum); });
            return reduceNum(sum);
        };

        const dadosGlobais = { tatwa: { principal: tattwas[mainIdx], sub: tattwas[subIdx] }, numerologia: { expressao: calcExp(nome), caminhoVida: reduceNum(dataNascimento), vibracaoHora: reduceNum(horaNascimento) } };
        const dadosAstronomica = gerarDadosSistema(getIauInfo(sunLon), getIauInfo(moonLon), getIauInfo(ascLon), getIauInfo(mcLon));
        const dadosTropical = gerarDadosSistema(getTropicalInfo(sunLon), getTropicalInfo(moonLon), getTropicalInfo(ascLon), getTropicalInfo(mcLon));

        const idUnico = crypto.randomUUID();
        try {
            if (env.DB) {
                await env.DB.prepare(`INSERT INTO mapas_astrologicos (id, nome, data_nascimento, hora_nascimento, local_nascimento, dados_astronomica, dados_tropical, dados_globais) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
                    .bind(idUnico, nome, dataNascimento, horaNascimento, localNascimento, JSON.stringify(dadosAstronomica), JSON.stringify(dadosTropical), JSON.stringify(dadosGlobais)).run();
            }
        } catch (e) { console.error("Falha ao gravar no BD.", e); }

        return new Response(JSON.stringify({ success: true, id: idUnico, dadosGlobais, dadosAstronomica, dadosTropical, query: { nome, dataNascimento, horaNascimento, localNascimento } }), { headers: { "Content-Type": "application/json" } });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}