import React, { useState, useEffect, useRef } from 'react';
import { Compass, Moon, Sun, Wind, Hash, Sparkles, BrainCircuit, Copy, Share2, Info, Star, Database, Lock, RefreshCw, MapPin, User, Calendar, Clock, X, HelpCircle, Mail, Send, Trash2, LogOut } from 'lucide-react';

// =====================================================================
// ⚙️ O LIVRO DOS REGISTROS (Semantic Versioning)
// =====================================================================
const APP_VERSION = "1.08.00";
const ADMIN_VERSION = "1.06.00"; // UPGRADE: Sessão Persistente (30 min) e Logout

const formatarData = (dataStr: string) => {
  if (!dataStr) return '';
  const p = dataStr.split('-');
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dataStr;
};

// =====================================================================
// MODAIS TRANSLÚCIDOS
// =====================================================================
const InfoModal = ({ type, onClose }: { type: 'astronomica' | 'tropical' | null, onClose: () => void }) => {
  if (!type) return null;
  const content = type === 'astronomica' ? {
    titulo: "Astrologia Astronômica", icon: <Star className="w-6 h-6 text-amber-400" />, borderColor: "border-amber-500/30", titleColor: "text-amber-400",
    texto: `<p>A <strong>Astrologia Astronômica Constelacional</strong> (ou Sideral Verdadeira) rompe com as antigas convenções sazonais. Ela se baseia no <strong>mapa real e físico do céu</strong> no minuto exato do seu nascimento.</p><p>Ao longo de milênios, a Terra sofreu um bamboleio em seu eixo chamado <em>Precessão dos Equinócios</em>. Este sistema recua cerca de 24 graus todo o zodíaco para corrigir essa distorção, alinhando a Astrologia à realidade estelar atual.</p><p>Ele respeita as fronteiras irregulares demarcadas pela <strong>União Astronômica Internacional (IAU)</strong> e insere a 13ª constelação: <strong>Ophiuchus (O Serpentário)</strong>.</p><p>Na visão da Umbanda Esotérica, este mapa revela a assinatura pura da sua <strong>Alma Ancestral</strong>.</p>`
  } : {
    titulo: "Astrologia Tropical", icon: <Sun className="w-6 h-6 text-orange-400" />, borderColor: "border-orange-500/30", titleColor: "text-orange-400",
    texto: `<p>A <strong>Astrologia Tropical</strong> (ou Sazonal) é o sistema ocidental tradicional. Estabelecido por Cláudio Ptolomeu, ele <strong>não mapeia o céu estrelado</strong>, mas sim os ciclos e ritmos do nosso planeta em relação ao Sol.</p><p>Neste sistema, o espaço sideral é dividido perfeitamente em 12 fatias idênticas de 30 graus. A roda zodiacal é reiniciada todos os anos no exato momento do Equinócio da Primavera.</p><p>Apesar de não refletir as estrelas de fundo, a Astrologia Tropical funciona como um impecável <em>relógio psicológico</em>.</p><p>Na Psicologia Analítica, o Mapa Tropical rege o nosso Ego inferior. Ele é a radiografia da <strong>Persona Terrena</strong>.</p>`
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`bg-slate-900 border ${content.borderColor} p-6 md:p-8 rounded-3xl max-w-2xl w-full shadow-2xl relative overflow-y-auto max-h-[90vh]`}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition"><X className="w-5 h-5 text-slate-300" /></button>
        <h2 className={`text-2xl md:text-3xl font-black ${content.titleColor} flex items-center gap-3 mb-6 border-b border-slate-800 pb-4`}>{content.icon} {content.titulo}</h2>
        <div className="text-slate-300 text-sm md:text-base leading-relaxed space-y-4 [&_p]:text-justify [&_p]:indent-8 [&_strong]:text-slate-100 [&_em]:text-slate-400" dangerouslySetInnerHTML={{ __html: content.texto }} />
        <button onClick={onClose} className="mt-8 w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold uppercase tracking-wider transition">Compreendido</button>
      </div>
    </div>
  );
};

const EmailModal = ({ isOpen, onClose, onSend, isSending }: any) => {
  const [email, setEmail] = useState('');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-blue-500/30 p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl relative">
        <button onClick={onClose} disabled={isSending} className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition disabled:opacity-50"><X className="w-5 h-5 text-slate-300" /></button>
        <h2 className="text-xl md:text-2xl font-black text-blue-400 flex items-center gap-3 mb-4"><Mail className="w-6 h-6" /> Enviar Dossiê Celestial</h2>
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">Insira o endereço de e-mail para receber o relatório astrológico completo, incluindo a análise profunda da Inteligência Artificial.</p>
        <input type="email" placeholder="usuario@email.com" className="w-full p-4 bg-slate-950 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition shadow-inner mb-6" value={email} onChange={e => setEmail(e.target.value)} disabled={isSending} />
        <button onClick={() => { if(email.includes('@')) onSend(email); }} disabled={isSending || !email.includes('@')} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold p-4 rounded-xl flex justify-center items-center gap-3 transition-all disabled:opacity-50 uppercase tracking-wider shadow-lg">
          {isSending ? <Sparkles className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5"/>}
          {isSending ? 'Transmitindo...' : 'Disparar E-mail'}
        </button>
      </div>
    </div>
  );
};

// =====================================================================
// AUTOCOMPLETAR GEOGRÁFICO
// =====================================================================
const LocationAutocomplete = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => {
  const [query, setQuery] = useState(''); const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false); const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; setQuery(val); onChange(val);
    if (val.length < 3) { setSuggestions([]); setIsOpen(false); return; }
    setLoading(true);
    const searchQuery = val.split(',')[0].trim();
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=pt&format=json`)
      .then(res => res.json())
      .then(data => { setSuggestions(data.results || []); if(data.results && data.results.length > 0) setIsOpen(true); })
      .finally(() => setLoading(false));
  };

  const handleSelect = (s: any) => {
    const locName = [s.name, s.admin1, s.country].filter(Boolean).join(', ');
    setQuery(locName); onChange(locName); setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input required type="text" placeholder="Ex: Rio de Janeiro, RJ" autoComplete="off" className="w-full p-4 pl-12 bg-slate-950 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition shadow-inner" value={query || value} onChange={handleInputChange} onFocus={() => suggestions.length > 0 && setIsOpen(true)} />
      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
      {loading && <Sparkles className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-amber-500" />}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-[100] w-full bg-slate-800 border border-slate-600 mt-2 rounded-xl shadow-2xl overflow-hidden divide-y divide-slate-700/50 max-h-60 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li key={i} onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }} className="p-3 hover:bg-slate-700 cursor-pointer flex items-center gap-3 transition-colors"><MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" /><span className="text-sm text-slate-200">{[s.name, s.admin1, s.country].filter(Boolean).join(', ')}</span></li>
          ))}
        </ul>
      )}
    </div>
  );
};

// =====================================================================
// COMPONENTE VISUAL PRINCIPAL (MÓDULOS ASTROLÓGICOS)
// =====================================================================
const RenderBlocoAstrologico = ({ titulo, dadosAstrologia, dadosUmbanda, icon: Icon, isTropical, onInfoClick }: any) => (
  <div className={`mt-8 pt-8 border-t ${isTropical ? 'border-orange-500/30' : 'border-amber-500/30'} animate-in slide-in-from-top-4 duration-700 w-full`}>
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <h2 className={`text-2xl md:text-3xl font-black flex items-center gap-3 ${isTropical ? 'text-orange-400' : 'text-amber-400'}`}><Icon className="w-8 h-8 flex-shrink-0" /> <span className="leading-tight">{titulo}</span></h2>
      <button type="button" onClick={onInfoClick} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border transition-all text-xs font-bold uppercase tracking-wider shadow-lg ${isTropical ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20' : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'}`}><HelpCircle className="w-4 h-4" /> Saiba mais</button>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full mb-8">
      <div className="bg-slate-900/80 p-5 md:p-6 rounded-2xl border border-slate-700 shadow-xl lg:col-span-4 w-full min-w-0">
        <h3 className="text-lg md:text-xl font-bold text-slate-300 mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">I. Astrologia ({isTropical ? '12 Signos' : '13 Signos'})</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {dadosAstrologia.map((a:any, i:number) => (
            <div key={i} className="bg-slate-950 p-3 md:p-4 rounded-xl border border-slate-800 flex flex-col justify-center min-w-0 shadow-inner"><p className="text-[10px] md:text-xs text-slate-400 mb-1 truncate">{a.astro}</p><p className="font-bold flex items-center gap-2 text-white text-xs sm:text-sm md:text-base truncate">{a.simbolo} {a.signo}</p></div>
          ))}
        </div>
      </div>
    </div>

    <div className={`bg-slate-900/80 p-3 md:p-8 rounded-2xl border ${isTropical ? 'border-orange-500/30' : 'border-emerald-500/30'} shadow-2xl w-full overflow-hidden`}>
      <h3 className={`text-xl md:text-2xl font-bold ${isTropical ? 'text-orange-400' : 'text-emerald-400'} mb-6 flex items-center gap-2 border-b ${isTropical ? 'border-orange-500/20' : 'border-emerald-500/20'} pb-4`}><Moon /> II. Umbanda ({isTropical ? 'Tropical' : 'Astronômica'})</h3>
      <div className="grid grid-cols-3 gap-2 md:gap-4 w-full">
        {dadosUmbanda.map((u:any, i:number) => (
          <div key={i} className={`flex flex-col items-center justify-between p-2 md:p-4 bg-slate-950 rounded-xl border border-slate-800 hover:${isTropical ? 'border-orange-500/50' : 'border-emerald-500/50'} transition-colors shadow-lg min-w-0 w-full h-full overflow-hidden`}>
            <span className="text-2xl md:text-4xl mb-1 md:mb-2 mt-1 drop-shadow-md flex-shrink-0">{u.simbolo}</span>
            <div className="flex items-center justify-center w-full mb-1 md:mb-2 h-8 sm:h-10"><p className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-slate-500 font-bold uppercase tracking-tighter md:tracking-wider text-center leading-tight line-clamp-2 px-0.5 w-full" style={{textWrap: "balance"}}>{u.posicao}</p></div>
            <div className="flex items-center justify-center w-full mt-auto bg-slate-900/50 py-1.5 md:py-2 px-0.5 rounded border border-slate-800/30 min-w-0"><p className="text-[9px] sm:text-[10px] md:text-lg font-black text-white uppercase tracking-tighter md:tracking-widest text-center truncate w-full">{u.orixa}</p></div>
          </div>
        ))}
      </div>
      {!isTropical && (
        <div className={`mt-4 md:mt-6 flex items-start gap-3 p-3 md:p-4 bg-emerald-950/30 border-emerald-900/50 rounded-xl border text-[11px] md:text-sm text-slate-300 leading-relaxed`}>
          <Info className="w-6 h-6 flex-shrink-0 mt-0.5 text-emerald-400" />
          <div className="flex flex-col gap-2 w-full">
            <p className="italic">O aplicativo revela a Tríplice Coroa Teórica. A verdadeira entidade regente e seu Orixá definitivo só podem ser atestados inequivocamente através da <strong>Lei de Pemba</strong> pelo Mestre de Iniciação.</p>
            <div className="text-[10px] md:text-xs text-emerald-200/70 border-t border-emerald-900/50 pt-2 mt-1 not-italic"><strong>* Entendendo as Horas:</strong> O <strong className="text-emerald-400">Período (3h)</strong> indica o Orixá que rege a faixa de horas do seu nascimento. O <strong className="text-emerald-400">Astro</strong> revela o planeta astrológico que regia o seu minuto exato de nascimento.</div>
          </div>
        </div>
      )}
    </div>
  </div>
);

// =====================================================================
// RENDERIZAÇÃO FINAL E O TRADUTOR ALQUÍMICO (Exportação)
// =====================================================================
const ResultView = ({ result, analiseIa, onSolicitarAnalise, loadingAi, openInfoModal, isUserView }: any) => {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const gerarTextoRelatorio = () => {
    let t = `🌌 *DIAGNÓSTICO ASTROLÓGICO E ESOTÉRICO* 🌌\n\n`;
    t += `👤 *Consulente:* ${result.query.nome}\n`;
    t += `📍 *Local:* ${result.query.localNascimento}\n`;
    t += `📅 *Nascimento:* ${formatarData(result.query.dataNascimento)} às ${result.query.horaNascimento}\n\n`;

    t += `🌬️ *FORÇAS GLOBAIS*\n`;
    t += `• Tatwa: ${result.dadosGlobais.tatwa.principal} / ${result.dadosGlobais.tatwa.sub}\n`;
    t += `• Numerologia: Expressão ${result.dadosGlobais.numerologia.expressao} | Caminho ${result.dadosGlobais.numerologia.caminhoVida} | Hora ${result.dadosGlobais.numerologia.vibracaoHora}\n\n`;

    t += `🌞 *MÓDULO I: TROPICAL SAZONAL (12 Signos)* - A Persona\n`;
    t += `☀️ Sol: ${result.dadosTropical.astrologia[0].signo} | ⬆️ Asc: ${result.dadosTropical.astrologia[1].signo} | 🌙 Lua: ${result.dadosTropical.astrologia[2].signo} | 🔭 MC: ${result.dadosTropical.astrologia[3].signo}\n`;
    t += `👑 Coroa: ${result.dadosTropical.umbanda[0].orixa} | 🌊 Adjuntó: ${result.dadosTropical.umbanda[1].orixa} | 🏹 Frente: ${result.dadosTropical.umbanda[2].orixa}\n`;
    t += `🌟 Decanato: ${result.dadosTropical.umbanda[3].orixa} | ⏳ Período (3h): ${result.dadosTropical.umbanda[4].orixa} | 🪐 Astro: ${result.dadosTropical.umbanda[5].orixa}\n\n`;

    t += `✨ *AGORA, A VERDADE OCULTA...* ✨\n`;
    t += `_A ilusão sazonal ficou para trás. Contemple sua verdadeira assinatura estelar:_\n\n`;

    t += `⭐ *MÓDULO II: ASTRONÔMICO CONSTELACIONAL (13 Signos)* - A Alma\n`;
    t += `☀️ Sol: ${result.dadosAstronomica.astrologia[0].signo} | ⬆️ Asc: ${result.dadosAstronomica.astrologia[1].signo} | 🌙 Lua: ${result.dadosAstronomica.astrologia[2].signo} | 🔭 MC: ${result.dadosAstronomica.astrologia[3].signo}\n`;
    t += `👑 Coroa: ${result.dadosAstronomica.umbanda[0].orixa} | 🌊 Adjuntó: ${result.dadosAstronomica.umbanda[1].orixa} | 🏹 Frente: ${result.dadosAstronomica.umbanda[2].orixa}\n`;
    t += `🌟 Decanato: ${result.dadosAstronomica.umbanda[3].orixa} | ⏳ Período (3h): ${result.dadosAstronomica.umbanda[4].orixa} | 🪐 Astro: ${result.dadosAstronomica.umbanda[5].orixa}\n\n`;
    
    if (analiseIa) {
      t += `🧠 *SÍNTESE DA INTELIGÊNCIA ARTIFICIAL*\n\n`;
      let iaTxt = analiseIa.replace(/<br\s*[\/]?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<strong>(.*?)<\/strong>/gi, '*$1*').replace(/<b>(.*?)<\/b>/gi, '*$1*').replace(/<em>(.*?)<\/em>/gi, '_$1_').replace(/<i>(.*?)<\/i>/gi, '_$1_').replace(/<li>(.*?)<\/li>/gi, '• $1\n').replace(/<\/ul>/gi, '\n').replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n*$1*\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
      t += iaTxt.replace(/\n{3,}/g, '\n\n').trim() + `\n\n`;
    }
    t += `✨ _Gerado via Oráculo Celestial da Raiz de Guiné_ ✨`;
    return t;
  };

  const gerarHtmlRelatorio = () => {
    let h = `<div style="font-family: sans-serif; color: #1e293b; background-color: #ffffff; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px;"><h2 style="color: #d97706; text-align: center; text-transform: uppercase;">🌌 Dossiê Astrológico</h2><p style="text-align: center; font-size: 18px; margin-bottom: 5px;"><strong>${result.query.nome}</strong></p><p style="text-align: center; font-size: 14px; color: #64748b; margin-top: 0;">${result.query.localNascimento}<br/>${formatarData(result.query.dataNascimento)} às ${result.query.horaNascimento}</p><h3 style="color: #0ea5e9; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">🌬️ Forças Globais</h3><p><strong>Tatwa Principal:</strong> ${result.dadosGlobais.tatwa.principal} <br/><strong>Sub-tatwa:</strong> ${result.dadosGlobais.tatwa.sub}</p><p><strong>Numerologia:</strong> Expressão ${result.dadosGlobais.numerologia.expressao} | Caminho ${result.dadosGlobais.numerologia.caminhoVida} | Hora ${result.dadosGlobais.numerologia.vibracaoHora}</p>`;
    const extrairHtml = (titulo: string, dados: any, cor: string) => {
      let m = `<h3 style="color: ${cor}; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 25px;">${titulo}</h3><p><strong>Astros:</strong> Sol em ${dados.astrologia[0].signo} | Asc em ${dados.astrologia[1].signo} | Lua em ${dados.astrologia[2].signo} | MC em ${dados.astrologia[3].signo}</p><p><strong>Umbanda:</strong> Coroa: ${dados.umbanda[0].orixa} | Adjuntó: ${dados.umbanda[1].orixa} | Frente: ${dados.umbanda[2].orixa}<br/>Decanato: ${dados.umbanda[3].orixa} | Período (3h): ${dados.umbanda[4].orixa}`;
      if (dados.umbanda[5]) m += ` | Astro: ${dados.umbanda[5].orixa}`;
      m += `</p>`; return m;
    };
    
    h += extrairHtml("🌞 Módulo I: Tropical Sazonal (A Persona)", result.dadosTropical, "#ea580c");
    
    h += `<div style="text-align: center; margin: 30px 0; padding: 20px; border: 1px solid #6366f1; background-color: #eef2ff; border-radius: 12px;">`;
    h += `<h3 style="color: #4f46e5; margin-top: 0; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">✨ Agora, a Verdade Oculta! ✨</h3>`;
    h += `<p style="color: #64748b; font-size: 14px; margin: 0;">A ilusão sazonal ficou para trás. Contemple a sua verdadeira assinatura estelar.</p>`;
    h += `</div>`;

    h += extrairHtml("⭐ Módulo II: Astronômico Constelacional (A Alma)", result.dadosAstronomica, "#d97706");
    
    if (analiseIa) { h += `<h3 style="color: #8b5cf6; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 30px;">🧠 Síntese da Inteligência Artificial</h3><div style="line-height: 1.6; color: #334155; text-align: justify;">${analiseIa}</div>`; }
    h += `<p style="text-align:center; font-size: 12px; color:#94a3b8; margin-top:30px; border-top: 1px solid #f1f5f9; padding-top: 15px;"><em>Gerado via Oráculo Celestial da Raiz de Guiné</em></p></div>`;
    return h;
  };

  const copiar = () => { navigator.clipboard.writeText(gerarTextoRelatorio()); alert("Dossiê Completo copiado para a memória!"); };
  const whatsapp = () => { window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(gerarTextoRelatorio())}`, '_blank'); };

  const dispararEmail = async (emailDestino: string) => {
    setSendingEmail(true);
    try {
      const res = await fetch('/api/enviar-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emailDestino, relatorioHtml: gerarHtmlRelatorio(), relatorioTexto: gerarTextoRelatorio(), nomeConsulente: result.query.nome }) });
      const data = await res.json();
      if (data.success) { alert(data.message); setEmailModalOpen(false); } else { alert(data.error); }
    } catch (e) { alert("Falha na ponte cósmica do e-mail."); }
    setSendingEmail(false);
  };

  return (
    <div className="w-full animate-in fade-in duration-700 max-w-5xl mx-auto mt-8">
      <EmailModal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} onSend={dispararEmail} isSending={sendingEmail} />

      <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8">
        <button onClick={copiar} className="flex-1 min-w-[140px] max-w-[200px] flex items-center justify-center gap-2 bg-slate-800 text-slate-200 hover:bg-slate-700 px-4 py-3 rounded-full transition-all text-[11px] md:text-sm font-bold uppercase tracking-wider border border-slate-700 shadow-lg"><Copy className="w-4 h-4" /> Copiar Tudo</button>
        <button onClick={whatsapp} className="flex-1 min-w-[140px] max-w-[200px] flex items-center justify-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-3 rounded-full transition-all text-[11px] md:text-sm font-bold uppercase tracking-wider border border-green-500/30 shadow-lg"><Share2 className="w-4 h-4" /> WhatsApp</button>
        <button onClick={() => setEmailModalOpen(true)} className="flex-1 min-w-[140px] max-w-[200px] flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-3 rounded-full transition-all text-[11px] md:text-sm font-bold uppercase tracking-wider border border-blue-500/30 shadow-lg"><Mail className="w-4 h-4" /> E-mail</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6 w-full mb-8">
        <div className="bg-slate-900/80 p-5 md:p-6 rounded-2xl border border-slate-700 shadow-xl w-full flex flex-col justify-center min-w-0">
          <h3 className="text-lg md:text-xl font-bold text-amber-500 mb-4 flex items-center gap-2 border-b border-slate-800 pb-2"><Wind /> Forças Globais: Tatwas</h3>
          <div className="space-y-3"><div className="bg-slate-950 p-3 md:p-4 rounded-xl border border-slate-800 flex justify-between items-center shadow-inner"><p className="text-[11px] md:text-xs text-slate-400">Principal</p><p className="font-bold text-white text-sm md:text-base truncate pl-2">{result.dadosGlobais.tatwa.principal}</p></div><div className="bg-slate-950 p-3 md:p-4 rounded-xl border border-slate-800 flex justify-between items-center shadow-inner"><p className="text-[11px] md:text-xs text-slate-400">Sub-tatwa</p><p className="font-bold text-white text-sm md:text-base truncate pl-2">{result.dadosGlobais.tatwa.sub}</p></div></div>
        </div>
        <div className="bg-slate-900/80 p-5 md:p-6 rounded-2xl border border-slate-700 shadow-xl w-full flex flex-col justify-center min-w-0">
          <h3 className="text-lg md:text-xl font-bold text-amber-500 mb-4 flex items-center gap-2 border-b border-slate-800 pb-2"><Hash /> Forças Globais: Numerologia</h3>
          <div className="space-y-3"><div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800 shadow-inner"><span className="text-[11px] md:text-xs text-slate-400">Expressão</span><strong className="text-sm md:text-base text-white">{result.dadosGlobais.numerologia.expressao}</strong></div><div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800 shadow-inner"><span className="text-[11px] md:text-xs text-slate-400">Caminho</span><strong className="text-sm md:text-base text-white">{result.dadosGlobais.numerologia.caminhoVida}</strong></div><div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800 shadow-inner"><span className="text-[11px] md:text-xs text-slate-400">Hora</span><strong className="text-sm md:text-base text-white">{result.dadosGlobais.numerologia.vibracaoHora}</strong></div></div>
        </div>
      </div>

      {/* 🔮 TROPICAL PRIMEIRO (A MÁSCARA/PERSONA) 🔮 */}
      <RenderBlocoAstrologico titulo="Módulo I: Astrológico Tropical" dadosAstrologia={result.dadosTropical.astrologia} dadosUmbanda={result.dadosTropical.umbanda} icon={Sun} isTropical={true} onInfoClick={() => openInfoModal('tropical')} />
      
      {/* 🚀 O BANNER DA REVELAÇÃO 🚀 */}
      <div className="w-full my-10 relative group max-w-5xl mx-auto animate-in zoom-in duration-1000">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-indigo-500/20 to-emerald-500/10 rounded-2xl blur-lg transition-all group-hover:via-indigo-500/30"></div>
        <div className="relative w-full bg-slate-900/90 border border-indigo-500/30 py-6 px-6 md:px-8 rounded-2xl shadow-2xl flex flex-col items-center justify-center text-center overflow-hidden">
          <Sparkles className="w-8 h-8 text-indigo-400 flex-shrink-0 animate-pulse mb-2" />
          <div className="flex flex-col items-center max-w-2xl">
            <h4 className="text-indigo-400 font-black uppercase tracking-widest text-sm md:text-xl mb-2">✨ Agora, a Verdade Oculta! ✨</h4>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              O módulo tradicional acima revelou a sua <strong>máscara terrena (Persona)</strong>. Desfaça a ilusão sazonal e contemple abaixo a sua <strong>verdadeira e exata assinatura estelar</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* 🪐 ASTRONÔMICO DEPOIS (A ALMA/VERDADE) 🪐 */}
      <RenderBlocoAstrologico titulo="Módulo II: Astronômico Constelacional" dadosAstrologia={result.dadosAstronomica.astrologia} dadosUmbanda={result.dadosAstronomica.umbanda} icon={Star} isTropical={false} onInfoClick={() => openInfoModal('astronomica')} />

      {isUserView && !analiseIa && onSolicitarAnalise && (
        <div className="flex justify-center mt-12 mb-8 w-full border-t border-purple-500/20 pt-12">
          <button onClick={onSolicitarAnalise} disabled={loadingAi} className="group relative px-6 md:px-10 py-5 bg-slate-900 border border-purple-500/50 rounded-full flex items-center justify-center gap-4 hover:bg-purple-900/30 transition-all shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] w-full md:w-auto">
            {loadingAi ? <Sparkles className="animate-spin text-purple-400 w-6 h-6" /> : <BrainCircuit className="text-purple-400 group-hover:scale-110 transition-transform w-6 h-6" />}
            <span className="font-black tracking-wide text-purple-200 text-sm md:text-lg uppercase">Solicitar Análise Psicanalítica e Esotérica por IA</span>
          </button>
        </div>
      )}

      {analiseIa && (
        <div className="mt-8 p-6 md:p-10 bg-slate-900/90 rounded-3xl border border-purple-500/40 shadow-2xl animate-in slide-in-from-bottom-8 duration-500 w-full overflow-hidden">
          <h3 className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6 md:mb-8 border-b border-purple-500/20 pb-4 flex items-center gap-3"><BrainCircuit className="text-purple-400 w-6 h-6 md:w-8 md:h-8 flex-shrink-0" /> Síntese do Mestre (IA)</h3>
          <div className="text-slate-300 text-sm md:text-base lg:text-lg leading-relaxed md:leading-loose space-y-4 [&_p]:text-justify [&_p]:indent-8 [&_p]:mb-4 [&_strong]:text-purple-300 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2 [&_li]:text-justify [&_h1]:text-2xl [&_h1]:text-left [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:text-left [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:text-left [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:text-purple-400" dangerouslySetInnerHTML={{ __html: analiseIa }} />
        </div>
      )}
    </div>
  );
};

// =====================================================================
// FRONTEND 1: PÚBLICO
// =====================================================================
function PublicApp({ openInfoModal }: any) {
  const [formData, setFormData] = useState({ nome: '', dataNascimento: '', horaNascimento: '', localNascimento: '' });
  const [loading, setLoading] = useState(false); const [loadingAi, setLoadingAi] = useState(false);
  const [result, setResult] = useState<any>(null); const [analiseIa, setAnaliseIa] = useState<string>('');

  const calcularMapa = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setAnaliseIa(''); setResult(null);
    try {
      const res = await fetch('/api/calcular', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const data = await res.json(); if (data.success) setResult(data); else alert(data.error || "Distúrbio Cósmico.");
    } catch (err) { alert("Erro de conexão."); }
    setLoading(false);
  };

  const solicitarAnalise = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/analisar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: result.id, dadosAstronomica: result.dadosAstronomica, dadosTropical: result.dadosTropical, dadosGlobais: result.dadosGlobais, query: result.query })
      });
      const data = await res.json(); if (data.analise) setAnaliseIa(data.analise);
    } catch (err) { alert("A Inteligência falhou."); }
    setLoadingAi(false);
  };

  return (
    <>
      <form onSubmit={calcularMapa} className="bg-slate-900/60 p-5 md:p-8 rounded-2xl border border-amber-500/20 mb-8 w-full grid md:grid-cols-2 gap-5 md:gap-6 shadow-xl backdrop-blur-md max-w-5xl">
        <div className="flex flex-col gap-1.5 w-full"><label className="flex items-center gap-2 text-[11px] md:text-xs font-bold text-amber-500 uppercase tracking-widest ml-1"><User className="w-4 h-4" /> Nome Completo</label><input required type="text" placeholder="Ex: João da Silva" className="w-full p-4 bg-slate-950 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition shadow-inner" onChange={e => setFormData({...formData, nome: e.target.value})} /></div>
        <div className="flex flex-col gap-1.5 w-full"><label className="flex items-center gap-2 text-[11px] md:text-xs font-bold text-amber-500 uppercase tracking-widest ml-1"><MapPin className="w-4 h-4" /> Local de Nascimento <span className="text-slate-500 normal-case tracking-normal">(Cidade, Estado)</span></label><LocationAutocomplete value={formData.localNascimento} onChange={(val) => setFormData({...formData, localNascimento: val})} /></div>
        <div className="flex flex-col gap-1.5 w-full"><label className="flex items-center gap-2 text-[11px] md:text-xs font-bold text-amber-500 uppercase tracking-widest ml-1"><Calendar className="w-4 h-4" /> Data de Nascimento</label><input required type="date" className="w-full p-4 bg-slate-950 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition shadow-inner [color-scheme:dark]" onChange={e => setFormData({...formData, dataNascimento: e.target.value})} /></div>
        <div className="flex flex-col gap-1.5 w-full"><label className="flex items-center gap-2 text-[11px] md:text-xs font-bold text-amber-500 uppercase tracking-widest ml-1"><Clock className="w-4 h-4" /> Horário de Nascimento <span className="text-slate-500 normal-case tracking-normal">(HH:mm)</span></label><input required type="time" className="w-full p-4 bg-slate-950 text-white border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition shadow-inner [color-scheme:dark]" onChange={e => setFormData({...formData, horaNascimento: e.target.value})} /></div>
        <button type="submit" disabled={loading} className="md:col-span-2 mt-4 w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold p-4 rounded-xl flex justify-center items-center gap-3 transition-all shadow-lg disabled:opacity-50 text-lg">
          {loading ? <Sparkles className="animate-spin" /> : <><Compass /> Extrair Arquitetura Sagrada</>}
        </button>
      </form>
      {result && <ResultView result={result} analiseIa={analiseIa} isUserView={true} onSolicitarAnalise={solicitarAnalise} loadingAi={loadingAi} openInfoModal={openInfoModal} />}
    </>
  );
}

// =====================================================================
// FRONTEND 2: ADMINISTRATIVO COM SESSÃO PERSISTENTE E LOGOUT
// =====================================================================
function AdminApp({ openInfoModal }: any) {
  const [senha, setSenha] = useState(''); 
  const [auth, setAuth] = useState(false);
  const [lista, setLista] = useState<any[]>([]); 
  const [selectedMap, setSelectedMap] = useState<any>(null);
  const [loadingList, setLoadingList] = useState(false); 
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const SESSION_KEY = 'oraculo_admin_session';

  const buscarRegistros = async (senhaAtual: string, isUpdate = false, isAutoLogin = false) => {
    if (isUpdate) setIsRefreshing(true); else if (!isAutoLogin) setLoadingList(true);
    try {
      const res = await fetch(`/api/admin/listar?senha=${encodeURIComponent(senhaAtual)}`);
      const data = await res.json();
      if (data.success) {
        setLista(data.mapas);
        setAuth(true);
        setSenha(senhaAtual);
        
        // ⏳ O RELÓGIO DA IMORTALIDADE: Renova por 30 minutos a cada busca bem-sucedida
        const expiresAt = Date.now() + 30 * 60 * 1000; 
        localStorage.setItem(SESSION_KEY, JSON.stringify({ senha: senhaAtual, expiresAt }));
      } else {
        if (!isUpdate && !isAutoLogin) alert(data.error || "Acesso Negado.");
        if (isAutoLogin) localStorage.removeItem(SESSION_KEY);
      }
    } catch (e) {
      if (!isUpdate && !isAutoLogin) alert("Erro ao acessar os registros Akáshicos.");
      if (isAutoLogin) localStorage.removeItem(SESSION_KEY);
    }
    if (isUpdate) setIsRefreshing(false); else setLoadingList(false);
    if (isAutoLogin) setIsCheckingSession(false);
  };

  // 👁️ O VIGIA TEMPORAL: Executado apenas na abertura/refresh da página
  useEffect(() => {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (sessionData) {
      try {
        const { senha: savedSenha, expiresAt } = JSON.parse(sessionData);
        if (Date.now() < expiresAt) {
          buscarRegistros(savedSenha, false, true);
        } else {
          localStorage.removeItem(SESSION_KEY); // O tempo esgotou
          setIsCheckingSession(false);
        }
      } catch (e) {
        localStorage.removeItem(SESSION_KEY);
        setIsCheckingSession(false);
      }
    } else {
      setIsCheckingSession(false);
    }
  }, []);

  const login = (e: React.FormEvent) => { e.preventDefault(); buscarRegistros(senha, false); };

  // 🚪 A CHAVE DE SAÍDA: Tranca o cofre e destrói a memória imediatamente
  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setAuth(false);
    setSenha('');
    setLista([]);
    setSelectedMap(null);
  };

  const carregarMapa = async (id: string) => {
    const res = await fetch('/api/admin/ler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, senha }) });
    const data = await res.json();
    if (data.success) { 
      const m = data.mapa; 
      setSelectedMap({ 
        id: m.id, 
        query: { nome: m.nome, data_nascimento: m.data_nascimento, horaNascimento: m.hora_nascimento, localNascimento: m.local_nascimento }, 
        dadosGlobais: JSON.parse(m.dados_globais), dadosAstronomica: JSON.parse(m.dados_astronomica), dadosTropical: JSON.parse(m.dados_tropical), analiseIa: m.analise_ia || '' 
      }); 
    }
  };

  const deletarMapa = async (id: string, nome: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Tem certeza absoluta de que deseja excluir permanentemente o registro de ${nome}?`)) return;
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/excluir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, senha }) });
      const data = await res.json();
      if (data.success) {
        setLista(prev => prev.filter(item => item.id !== id));
        if (selectedMap?.id === id) setSelectedMap(null);
      } else { alert(data.error || "Erro ao tentar excluir."); }
    } catch (err) { alert("Falha de conexão com o servidor."); }
    setIsRefreshing(false);
  };

  // Tela de Transição Silenciosa para não "piscar" a tela de login
  if (isCheckingSession) {
    return (
      <div className="flex flex-col items-center justify-center p-12 w-full mt-10 animate-in fade-in">
        <Sparkles className="w-12 h-12 text-rose-500 animate-spin mb-4" />
        <p className="text-rose-400 font-bold uppercase tracking-widest text-sm">Restaurando Elo Akáshico...</p>
      </div>
    );
  }

  if (!auth) return (
    <form onSubmit={login} className="flex flex-col items-center p-8 bg-slate-900 rounded-2xl border border-rose-500/30 w-full max-w-sm mt-10 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95">
      <Lock className="w-16 h-16 text-rose-500 mb-4 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
      <h2 className="text-xl font-bold mb-6 text-white uppercase tracking-widest text-center">Santuário Mestre</h2>
      <input type="password" placeholder="Chave de Acesso" className="w-full p-4 bg-slate-950 border border-slate-800 rounded-lg text-white text-center mb-6 focus:ring-2 focus:ring-rose-500 outline-none tracking-[0.3em]" onChange={e => setSenha(e.target.value)} value={senha} />
      <button type="submit" disabled={loadingList} className="w-full bg-gradient-to-r from-rose-700 to-rose-500 hover:from-rose-600 font-bold text-white p-4 rounded-lg uppercase tracking-wider">{loadingList ? "Invocando..." : "Desbloquear"}</button>
    </form>
  );

  return (
    <div className="w-full flex flex-col items-center max-w-5xl animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900/80 border border-rose-500/30 rounded-xl overflow-hidden mb-8 shadow-xl flex flex-col">
        
        {/* 👇 NOVO CABEÇALHO DO ADMIN COM LOGOUT 👇 */}
        <div className="bg-slate-800/80 p-3 text-sm font-bold text-rose-300 border-b border-rose-500/20 uppercase tracking-widest flex items-center justify-between shadow-sm px-4">
          <div className="flex items-center gap-2"><Database className="w-4 h-4" /> Registros Akáshicos</div>
          <button onClick={logout} className="text-rose-400 hover:text-rose-200 transition-colors p-1.5 rounded-md hover:bg-rose-500/20" title="Trancar o Cofre (Sair)">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        
        <ul className="max-h-[142px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-900 [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full">
          {lista.map(item => (
            <li key={item.id} className="flex items-stretch border-b border-slate-800/60 hover:bg-slate-800 group transition-colors">
              <button onClick={() => carregarMapa(item.id)} className="flex-grow text-left px-4 py-3 text-slate-300 font-medium text-sm flex justify-between items-center overflow-hidden outline-none">
                <span className="truncate pr-2">{item.nome} <span className="text-slate-600 mx-1">:</span> <span className="text-rose-400/80 group-hover:text-rose-400">{formatarData(item.data_nascimento)}</span></span>
              </button>
              <button onClick={(e) => deletarMapa(item.id, item.nome, e)} className="px-4 py-3 text-slate-600 hover:text-rose-500 opacity-50 md:opacity-30 md:group-hover:opacity-100 transition-all outline-none flex-shrink-0" title="Excluir Permanentemente">
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
          {lista.length === 0 && <li className="p-4 text-center text-slate-500 text-sm">O vazio sideral...</li>}
        </ul>

        <div className="bg-slate-950/90 p-3 flex justify-between items-center border-t border-rose-500/30">
          <span className="text-xs font-medium text-slate-500 tracking-wide">Total: <strong className="text-rose-400">{lista.length}</strong></span>
          <button onClick={() => buscarRegistros(senha, true)} disabled={isRefreshing} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 transition-all text-xs font-bold uppercase tracking-wider disabled:opacity-50"><RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Atualizar</button>
        </div>
      </div>
      
      {selectedMap && (
        <div className="w-full border-t border-rose-900/50 pt-8 mt-4 animate-in slide-in-from-bottom-4">
          <h2 className="text-center text-xl md:text-2xl text-white font-bold mb-8 bg-slate-900/80 p-4 rounded-xl border border-slate-800">Ficha Oculta de: <span className="text-amber-400">{selectedMap.query.nome}</span></h2>
          <ResultView result={selectedMap} analiseIa={selectedMap.analiseIa} isUserView={false} openInfoModal={openInfoModal} onSolicitarAnalise={null} />
        </div>
      )}
    </div>
  );
}

// =====================================================================
// ROTEADOR INVISÍVEL
// =====================================================================
export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalType, setModalType] = useState<'astronomica' | 'tropical' | null>(null);

  useEffect(() => {
    const checkHash = () => setIsAdmin(window.location.hash === '#admin');
    checkHash(); window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col items-center w-full overflow-x-hidden relative">
      <InfoModal type={modalType} onClose={() => setModalType(null)} />
      
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center flex-grow p-3 sm:p-6 md:p-8">
        <header className="text-center mb-8 md:mb-10 w-full flex flex-col items-center px-2">
          <Compass className={`w-14 h-14 md:w-16 md:h-16 mb-4 drop-shadow-lg transition-colors ${isAdmin ? 'text-rose-500' : 'text-amber-500'}`} />
          <h1 className={`w-full text-center font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${isAdmin ? 'from-rose-300 to-rose-600' : 'from-amber-200 to-amber-500'} mb-2 uppercase transition-colors`} style={{ fontSize: "clamp(12px, 3.4vw, 42px)", textWrap: "balance" }}>
            {isAdmin ? 'Câmara do Mestre' : 'Diagnóstico Astrológico'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm md:text-xl font-medium tracking-wide mt-2">Umbanda Esotérica da Raiz de Guiné <span className="text-slate-500 text-[10px] md:text-sm">(W. W. da Matta e Silva)</span></p>
        </header>
        
        <div className="w-full flex-grow flex flex-col items-center">
          {isAdmin ? <AdminApp openInfoModal={setModalType} /> : <PublicApp openInfoModal={setModalType} />}
        </div>
      </div>

      {/* 🏷️ RODAPÉ DO SISTEMA DE VERSÕES */}
      <footer className="w-full py-4 md:py-6 mt-12 border-t border-slate-900 bg-slate-950 flex justify-center items-center shrink-0">
        <p className="text-slate-600 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs text-center flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
          <span className="opacity-50">Oráculo Celestial</span> 
          <span className="hidden sm:inline opacity-30">•</span> 
          <span className={`${isAdmin ? 'text-rose-900/80' : 'text-slate-500'} transition-colors`}>
            {isAdmin ? `ADMIN v${ADMIN_VERSION}` : `APP v${APP_VERSION}`}
          </span>
        </p>
      </footer>
    </div>
  );
}