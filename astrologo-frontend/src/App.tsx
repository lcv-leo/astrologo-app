import React, { useState, useEffect, useRef } from 'react';
import { Compass, Moon, Sun, Wind, Hash, Sparkles, BrainCircuit, Copy, Share2, Info, Star, MapPin, User, Calendar, Clock, X, HelpCircle, Mail, Send, RotateCcw } from 'lucide-react';

const APP_VERSION = "2.08.00";

interface AstroData { astro: string; signo: string; simbolo: string; }
interface UmbandaData { posicao: string; orixa: string; simbolo: string; }
interface DadosGlobais { tatwa: { principal: string; sub: string; }; numerologia: { expressao: number; caminhoVida: number; vibracaoHora: number; }; }
interface DadosSistema { astrologia: AstroData[]; umbanda: UmbandaData[]; }
interface ResultData { id: string; query: { nome: string; localNascimento: string; dataNascimento: string; horaNascimento: string; }; dadosGlobais: DadosGlobais; dadosAstronomica: DadosSistema; dadosTropical: DadosSistema; }
interface ModalProps { type: 'astronomica' | 'tropical' | null; onClose: () => void; }
interface EmailModalProps { isOpen: boolean; onClose: () => void; onSend: (email: string) => void; isSending: boolean; }
interface AutocompleteProps { value: string; onChange: (v: string) => void; }
interface BlocoProps { titulo: string; dadosAstrologia: AstroData[]; dadosUmbanda: UmbandaData[]; icon: React.ElementType; isTropical: boolean; onInfoClick: () => void; }
interface ResultViewProps { result: ResultData; analiseIa: string; onSolicitarAnalise?: () => void; loadingAi?: boolean; openInfoModal: (t: 'astronomica' | 'tropical') => void; }
interface GeoResult { name?: string; admin1?: string; country?: string; }

const formatarData = (dataStr: string): string => {
  if (!dataStr) return ''; const p = dataStr.split('-'); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dataStr;
};

// Tradutor visual para garantir compatibilidade com mapas antigos já salvos no BD
const formatPosicaoLabel = (pos: string): string => {
  const p = pos.toUpperCase();
  if (p.includes('FAIXA') || p.includes('PERÍODO')) return 'FAIXA HORÁRIA (3H)';
  if (p.includes('ASTRO') || p.includes('PLANETÁRIA')) return 'HORA PLANETÁRIA';
  return p;
};

const InfoModal: React.FC<ModalProps> = ({ type, onClose }) => {
  if (!type) return null;
  const content = type === 'astronomica' ? {
    titulo: "Astrologia Astronômica", icon: <Star className="w-5 h-5 text-amber-500" />, borderColor: "border-amber-300", titleColor: "text-amber-700",
    texto: `<p>A <strong>Astrologia Astronômica Constelacional</strong> rompe com as convenções sazonais. Ela se baseia no <strong>mapa real e físico do céu</strong> no minuto exato do seu nascimento, inserindo a 13ª constelação: <strong>Ophiuchus</strong>.</p>`
  } : {
    titulo: "Astrologia Tropical", icon: <Sun className="w-5 h-5 text-orange-500" />, borderColor: "border-orange-300", titleColor: "text-orange-700",
    texto: `<p>A <strong>Astrologia Tropical</strong> (ou Sazonal) não mapeia o céu estrelado, mas sim os ciclos e ritmos do nosso planeta. Funciona como um impecável <em>relógio psicológico</em> da sua <strong>Persona Terrena</strong>.</p>`
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`bg-white/90 backdrop-blur-2xl border ${content.borderColor} p-6 md:p-8 rounded-3xl max-w-xl w-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-y-auto max-h-[90vh]`}>
        <button onClick={onClose} aria-label="Fechar Modal" className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition"><X className="w-4 h-4 text-slate-600" /></button>
        <h2 className={`text-lg md:text-xl font-black ${content.titleColor} flex items-center gap-3 mb-4 border-b border-slate-200 pb-3`}>{content.icon} {content.titulo}</h2>
        <div className="text-slate-700 text-xs md:text-sm leading-relaxed space-y-4 [&_p]:text-justify" dangerouslySetInnerHTML={{ __html: content.texto }} />
        <button onClick={onClose} className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold uppercase tracking-wider transition shadow-lg text-xs md:text-sm">Compreendido</button>
      </div>
    </div>
  );
};

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, onSend, isSending }) => {
  const [email, setEmail] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-2xl border border-white p-6 md:p-8 rounded-3xl max-w-md w-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative">
        <button onClick={onClose} disabled={isSending} aria-label="Fechar Modal E-mail" className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition disabled:opacity-50"><X className="w-4 h-4 text-slate-600" /></button>
        <h2 className="text-lg md:text-xl font-black text-blue-600 flex items-center gap-3 mb-4"><Mail className="w-5 h-5" /> Enviar Dossiê Celestial</h2>
        <p className="text-slate-600 text-xs md:text-sm mb-6 leading-relaxed">Insira o endereço de e-mail para receber o relatório astrológico completo e a análise da IA.</p>
        <label htmlFor="emailConsulente" className="sr-only">Endereço de E-mail</label>
        <input type="email" id="emailConsulente" placeholder="usuario@email.com" className="w-full p-3 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition shadow-inner mb-6 text-sm" value={email} onChange={e => setEmail(e.target.value)} disabled={isSending} />
        <button onClick={() => { if (email.includes('@')) onSend(email); }} disabled={isSending || !email.includes('@')} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold p-3 rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-50 uppercase tracking-wider shadow-md text-xs md:text-sm">
          {isSending ? <Sparkles className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />} {isSending ? 'Transmitindo...' : 'Disparar E-mail'}
        </button>
      </div>
    </div>
  );
};

const LocationAutocomplete: React.FC<AutocompleteProps> = ({ value, onChange }) => {
  const [query, setQuery] = useState(''); const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [isOpen, setIsOpen] = useState(false); const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClickOutside); return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; setQuery(val); onChange(val);
    if (val.length < 3) { setSuggestions([]); setIsOpen(false); return; }
    setLoading(true); const searchQuery = val.split(',')[0].trim();
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=pt&format=json`)
      .then(res => res.json()).then(data => { const d = data as { results?: GeoResult[] }; setSuggestions(d.results || []); if (d.results && d.results.length > 0) setIsOpen(true); }).finally(() => setLoading(false));
  };

  const handleSelect = (s: GeoResult) => { const locName = [s.name, s.admin1, s.country].filter(Boolean).join(', '); setQuery(locName); onChange(locName); setIsOpen(false); };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input id="localNascimentoInput" required type="text" placeholder="Ex: Rio de Janeiro, RJ" autoComplete="off" className="w-full p-3.5 pl-10 bg-white/80 text-slate-800 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition shadow-sm backdrop-blur-sm text-sm font-medium" value={query || value} onChange={handleInputChange} onFocus={() => suggestions.length > 0 && setIsOpen(true)} />
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
      {loading && <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-blue-500" />}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-[100] w-full bg-white/95 backdrop-blur-xl border border-slate-200 mt-2 rounded-xl shadow-2xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li key={i} onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }} className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors"><MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" /><span className="text-xs text-slate-700 font-medium">{[s.name, s.admin1, s.country].filter(Boolean).join(', ')}</span></li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const RenderBlocoAstrologico: React.FC<BlocoProps> = ({ titulo, dadosAstrologia, dadosUmbanda, icon: Icon, isTropical, onInfoClick }) => {
  const colorTheme = isTropical ? 'orange' : 'indigo'; const colorHex = isTropical ? 'text-orange-600' : 'text-indigo-600'; const bgSoft = isTropical ? 'bg-orange-50' : 'bg-indigo-50';
  return (
    <div className={`mt-8 pt-8 border-t border-${colorTheme}-200 animate-in slide-in-from-top-4 duration-700 w-full`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className={`text-lg md:text-xl font-black flex items-center gap-2 ${colorHex}`}><Icon className="w-6 h-6 flex-shrink-0" /> <span className="leading-tight text-balance">{titulo}</span></h2>
        <button type="button" aria-label="Saiba mais sobre o módulo" onClick={onInfoClick} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full border transition-all text-[10px] font-bold uppercase tracking-wider shadow-sm bg-white hover:shadow-md border-${colorTheme}-200 ${colorHex} hover:bg-${colorTheme}-50`}><HelpCircle className="w-3.5 h-3.5" /> Saiba mais</button>
      </div>

      <div className="bg-white/60 backdrop-blur-xl p-4 md:p-6 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] w-full mb-6">
        <h3 className="text-sm md:text-base font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">I. Astrologia ({isTropical ? '12 Signos' : '13 Signos'})</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {dadosAstrologia.map((a, i) => (
            <div key={i} className="bg-white p-3 rounded-2xl border border-slate-100 flex flex-col justify-center shadow-sm"><p className="text-[9px] md:text-[10px] text-slate-500 mb-1 truncate font-medium">{a.astro}</p><p className="font-bold flex items-center gap-2 text-slate-800 text-xs sm:text-sm truncate">{a.simbolo} {a.signo}</p></div>
          ))}
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl p-4 md:p-6 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] w-full overflow-hidden">
        <h3 className={`text-sm md:text-base font-bold ${colorHex} mb-4 flex items-center gap-2 border-b border-slate-200 pb-2`}><Moon className="inline w-4 h-4 md:w-5 md:h-5" /> II. Umbanda ({isTropical ? 'Tropical' : 'Astronômica'})</h3>
        <div className="grid grid-cols-3 gap-2 md:gap-4 w-full">
          {dadosUmbanda.map((u, i) => (
            <div key={i} className={`flex flex-col items-center justify-between p-2 md:p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow min-w-0 w-full h-full`}>
              <span className="text-xl md:text-3xl mb-1 md:mb-2 mt-1 drop-shadow-sm flex-shrink-0">{u.simbolo}</span>
              <div className="flex items-center justify-center w-full mb-1 md:mb-2 h-8"><p className="text-[7px] sm:text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center leading-tight line-clamp-2 px-0.5 w-full text-balance">{formatPosicaoLabel(u.posicao)}</p></div>
              <div className={`flex items-center justify-center w-full mt-auto ${bgSoft} py-1.5 md:py-2 px-1 rounded-xl border border-${colorTheme}-200 min-w-0`}><p className={`text-[8px] sm:text-[9px] md:text-[11px] font-black ${colorHex} uppercase tracking-widest text-center truncate w-full`}>{u.orixa}</p></div>
            </div>
          ))}
        </div>
        {!isTropical && (
          <div className="mt-5 flex items-start gap-2.5 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[10px] md:text-xs text-emerald-900 leading-relaxed shadow-sm">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
            <div className="flex flex-col gap-1 w-full">
              <p className="italic">O aplicativo revela a Tríplice Coroa Teórica. A verdadeira entidade regente e seu Orixá definitivo só podem ser atestados inequivocamente através da <strong>Lei de Pemba</strong> pelo Mestre de Iniciação.</p>
              <div className="text-[9px] md:text-[10px] text-emerald-700/80 border-t border-emerald-200/50 pt-1.5 mt-1 not-italic"><strong>* Entendendo as Horas:</strong> O <strong>Período (3h)</strong> indica o Orixá que rege a faixa de horas do seu nascimento. O <strong>Astro</strong> revela o planeta astrológico que regia o seu minuto exato de nascimento.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ResultView: React.FC<ResultViewProps> = ({ result, analiseIa, onSolicitarAnalise, loadingAi, openInfoModal }) => {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const gerarTextoRelatorio = (): string => {
    let t = `🌌 *DIAGNÓSTICO ASTROLÓGICO E ESOTÉRICO* 🌌\n\n👤 *Consulente:* ${result.query.nome}\n📍 *Local:* ${result.query.localNascimento}\n📅 *Nascimento:* ${formatarData(result.query.dataNascimento)} às ${result.query.horaNascimento}\n\n`;
    t += `🌬️ *FORÇAS GLOBAIS*\n• Tatwa: ${result.dadosGlobais.tatwa.principal} / ${result.dadosGlobais.tatwa.sub}\n• Numerologia: Expressão ${result.dadosGlobais.numerologia.expressao} | Caminho ${result.dadosGlobais.numerologia.caminhoVida} | Hora ${result.dadosGlobais.numerologia.vibracaoHora}\n\n`;
    t += `🌞 *MÓDULO I: TROPICAL SAZONAL (12 Signos)* - A Persona\n☀️ Sol: ${result.dadosTropical.astrologia[0].signo} | ⬆️ Asc: ${result.dadosTropical.astrologia[1].signo} | 🌙 Lua: ${result.dadosTropical.astrologia[2].signo} | 🔭 MC: ${result.dadosTropical.astrologia[3].signo}\n👑 Coroa: ${result.dadosTropical.umbanda[0].orixa} | 🌊 Adjuntó: ${result.dadosTropical.umbanda[1].orixa} | 🏹 Frente: ${result.dadosTropical.umbanda[2].orixa}\n🌟 Decanato: ${result.dadosTropical.umbanda[3].orixa} | ⏳ FAIXA HORÁRIA (3H): ${result.dadosTropical.umbanda[4].orixa} | 🪐 HORA PLANETÁRIA: ${result.dadosTropical.umbanda[5].orixa}\n\n`;
    t += `✨ *AGORA, A VERDADE OCULTA...* ✨\n_O módulo tropical acima revelou a sua máscara terrena (Persona). Desfaça a ilusão sazonal e contemple abaixo a sua verdadeira assinatura estelar:_\n\n`;
    t += `⭐ *MÓDULO II: ASTRONÔMICO CONSTELACIONAL (13 Signos)* - A Alma\n☀️ Sol: ${result.dadosAstronomica.astrologia[0].signo} | ⬆️ Asc: ${result.dadosAstronomica.astrologia[1].signo} | 🌙 Lua: ${result.dadosAstronomica.astrologia[2].signo} | 🔭 MC: ${result.dadosAstronomica.astrologia[3].signo}\n👑 Coroa: ${result.dadosAstronomica.umbanda[0].orixa} | 🌊 Adjuntó: ${result.dadosAstronomica.umbanda[1].orixa} | 🏹 Frente: ${result.dadosAstronomica.umbanda[2].orixa}\n🌟 Decanato: ${result.dadosAstronomica.umbanda[3].orixa} | ⏳ FAIXA HORÁRIA (3H): ${result.dadosAstronomica.umbanda[4].orixa} | 🪐 HORA PLANETÁRIA: ${result.dadosAstronomica.umbanda[5].orixa}\n\n`;
    if (analiseIa) {
      const iaTxt = analiseIa.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<strong>(.*?)<\/strong>/gi, '*$1*').replace(/<b>(.*?)<\/b>/gi, '*$1*').replace(/<em>(.*?)<\/em>/gi, '_$1_').replace(/<i>(.*?)<\/i>/gi, '_$1_').replace(/<li>(.*?)<\/li>/gi, '• $1\n').replace(/<\/ul>/gi, '\n').replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n*$1*\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
      t += `🧠 *SÍNTESE DA INTELIGÊNCIA ARTIFICIAL*\n\n` + iaTxt.replace(/\n{3,}/g, '\n\n').trim() + `\n\n`;
    }
    t += `✨ _Gerado via Oráculo Celestial_ ✨`; return t;
  };

  const gerarHtmlRelatorio = (): string => {
    let h = `<div style="font-family: sans-serif; color: #1e293b; background-color: #f8fafc; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px;"><h2 style="color: #d97706; text-align: center; text-transform: uppercase;">🌌 Dossiê Astrológico</h2><p style="text-align: center; font-size: 18px; margin-bottom: 5px;"><strong>${result.query.nome}</strong></p><p style="text-align: center; font-size: 14px; color: #64748b; margin-top: 0;">${result.query.localNascimento}<br/>${formatarData(result.query.dataNascimento)} às ${result.query.horaNascimento}</p><h3 style="color: #0ea5e9; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">🌬️ Forças Globais</h3><p><strong>Tatwa Principal:</strong> ${result.dadosGlobais.tatwa.principal} <br/><strong>Sub-tatwa:</strong> ${result.dadosGlobais.tatwa.sub}</p><p><strong>Numerologia:</strong> Expressão ${result.dadosGlobais.numerologia.expressao} | Caminho ${result.dadosGlobais.numerologia.caminhoVida} | Hora ${result.dadosGlobais.numerologia.vibracaoHora}</p>`;
    const extrairHtml = (titulo: string, dados: DadosSistema, cor: string) => {
      return `<h3 style="color: ${cor}; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 25px;">${titulo}</h3><p><strong>Astros:</strong> Sol em ${dados.astrologia[0].signo} | Asc em ${dados.astrologia[1].signo} | Lua em ${dados.astrologia[2].signo} | MC em ${dados.astrologia[3].signo}</p><p><strong>Umbanda:</strong> Coroa: ${dados.umbanda[0].orixa} | Adjuntó: ${dados.umbanda[1].orixa} | Frente: ${dados.umbanda[2].orixa}<br/>Decanato: ${dados.umbanda[3].orixa} | Faixa Horária (3H): ${dados.umbanda[4].orixa} | Hora Planetária: ${dados.umbanda[5].orixa}</p>`;
    };
    h += extrairHtml("🌞 Módulo I: Tropical Sazonal (A Persona)", result.dadosTropical, "#ea580c");
    h += `<div style="text-align: center; margin: 30px 0; padding: 20px; border: 1px solid #c7d2fe; background-color: #e0e7ff; border-radius: 12px;"><h3 style="color: #4f46e5; margin-top: 0; margin-bottom: 8px; text-transform: uppercase;">✨ A Verdade Oculta ✨</h3><p style="color: #475569; font-size: 14px; margin: 0;">O módulo tropical acima revelou a sua máscara terrena (Persona). Desfaça a ilusão sazonal e contemple abaixo a sua verdadeira assinatura estelar.</p></div>`;
    h += extrairHtml("⭐ Módulo II: Astronômico Constelacional (A Alma)", result.dadosAstronomica, "#d97706");
    if (analiseIa) { h += `<h3 style="color: #8b5cf6; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 30px;">🧠 Síntese da Inteligência Artificial</h3><div style="line-height: 1.6; color: #334155; text-align: justify;">${analiseIa}</div>`; }
    h += `<p style="text-align:center; font-size: 12px; color:#94a3b8; margin-top:30px; border-top: 1px solid #e2e8f0; padding-top: 15px;"><em>Gerado via Oráculo Celestial</em></p></div>`; return h;
  };

  const copiar = () => { navigator.clipboard.writeText(gerarTextoRelatorio()); alert("Dossiê copiado para a memória!"); };
  const whatsapp = () => { window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(gerarTextoRelatorio())}`, '_blank'); };
  const dispararEmail = async (emailDestino: string) => {
    setSendingEmail(true);
    try {
      const res = await fetch('/api/enviar-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emailDestino, relatorioHtml: gerarHtmlRelatorio(), relatorioTexto: gerarTextoRelatorio(), nomeConsulente: result.query.nome }) });
      const data = await res.json() as { success: boolean; message?: string; error?: string };
      if (data.success) { alert(String(data.message)); setEmailModalOpen(false); } else { alert(String(data.error)); }
    } catch { alert("Falha na ponte do e-mail."); }
    setSendingEmail(false);
  };

  return (
    <div className="w-full animate-in fade-in duration-700 max-w-5xl mx-auto mt-8">
      <EmailModal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} onSend={dispararEmail} isSending={sendingEmail} />

      <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8">
        <button onClick={copiar} aria-label="Copiar Tudo" className="flex-1 min-w-[120px] max-w-[180px] flex items-center justify-center gap-2 bg-white text-slate-700 hover:bg-slate-50 px-3 py-2.5 rounded-full transition-all text-[9px] md:text-[10px] font-bold uppercase tracking-wider border border-slate-200 shadow-sm hover:shadow-md"><Copy className="w-3.5 h-3.5" /> Copiar Tudo</button>
        <button onClick={whatsapp} aria-label="Compartilhar no WhatsApp" className="flex-1 min-w-[120px] max-w-[180px] flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-2.5 rounded-full transition-all text-[9px] md:text-[10px] font-bold uppercase tracking-wider border border-emerald-200 shadow-sm hover:shadow-md"><Share2 className="w-3.5 h-3.5" /> WhatsApp</button>
        <button onClick={() => setEmailModalOpen(true)} aria-label="Enviar por E-mail" className="flex-1 min-w-[120px] max-w-[180px] flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2.5 rounded-full transition-all text-[9px] md:text-[10px] font-bold uppercase tracking-wider border border-blue-200 shadow-sm hover:shadow-md"><Mail className="w-3.5 h-3.5" /> E-mail</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-5 w-full mb-6">
        <div className="bg-white/70 backdrop-blur-2xl p-4 md:p-6 rounded-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] w-full flex flex-col justify-center min-w-0">
          <h3 className="text-sm md:text-base font-bold text-blue-600 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2"><Wind className="text-blue-500 w-4 h-4" /> Forças Globais: Tatwas</h3>
          <div className="space-y-2"><div className="bg-white/80 p-2.5 md:p-3 rounded-lg border border-slate-100 flex justify-between items-center shadow-sm"><p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wide">Principal</p><p className="font-bold text-slate-800 text-xs md:text-sm truncate pl-2">{String(result.dadosGlobais.tatwa.principal)}</p></div><div className="bg-white/80 p-2.5 md:p-3 rounded-lg border border-slate-100 flex justify-between items-center shadow-sm"><p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wide">Sub-tatwa</p><p className="font-bold text-slate-800 text-xs md:text-sm truncate pl-2">{String(result.dadosGlobais.tatwa.sub)}</p></div></div>
        </div>
        <div className="bg-white/70 backdrop-blur-2xl p-4 md:p-6 rounded-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] w-full flex flex-col justify-center min-w-0">
          <h3 className="text-sm md:text-base font-bold text-blue-600 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2"><Hash className="text-blue-500 w-4 h-4" /> Forças Globais: Numerologia</h3>
          <div className="space-y-2"><div className="flex justify-between items-center bg-white/80 p-2.5 md:p-3 rounded-lg border border-slate-100 shadow-sm"><span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wide">Expressão</span><strong className="text-xs md:text-sm text-slate-800">{String(result.dadosGlobais.numerologia.expressao)}</strong></div><div className="flex justify-between items-center bg-white/80 p-2.5 md:p-3 rounded-lg border border-slate-100 shadow-sm"><span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wide">Caminho</span><strong className="text-xs md:text-sm text-slate-800">{String(result.dadosGlobais.numerologia.caminhoVida)}</strong></div><div className="flex justify-between items-center bg-white/80 p-2.5 md:p-3 rounded-lg border border-slate-100 shadow-sm"><span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wide">Hora</span><strong className="text-xs md:text-sm text-slate-800">{String(result.dadosGlobais.numerologia.vibracaoHora)}</strong></div></div>
        </div>
      </div>

      <RenderBlocoAstrologico titulo="Módulo I: Astrológico Tropical" dadosAstrologia={result.dadosTropical.astrologia} dadosUmbanda={result.dadosTropical.umbanda} icon={Sun} isTropical={true} onInfoClick={() => openInfoModal('tropical')} />

      <div className="w-full my-10 relative group max-w-4xl mx-auto animate-in zoom-in duration-1000">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-200/50 via-indigo-200/50 to-emerald-200/50 rounded-3xl blur-2xl transition-all group-hover:via-indigo-300/50"></div>
        <div className="relative w-full bg-white/80 backdrop-blur-2xl border border-white/50 py-6 px-5 md:px-8 rounded-3xl shadow-[0_8px_32px_rgba(99,102,241,0.15)] flex flex-col items-center justify-center text-center overflow-hidden">
          <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-indigo-500 flex-shrink-0 animate-pulse mb-2" />
          <div className="flex flex-col items-center max-w-xl"><h4 className="text-indigo-600 font-black uppercase tracking-widest text-[10px] md:text-sm mb-2">✨ Agora, a Verdade Oculta! ✨</h4><p className="text-slate-600 text-[10px] md:text-xs leading-relaxed text-balance">O módulo tropical acima revelou a sua <strong>máscara terrena (Persona)</strong>. Desfaça a ilusão sazonal e contemple abaixo a sua <strong>verdadeira assinatura estelar</strong>.</p></div>
        </div>
      </div>

      <RenderBlocoAstrologico titulo="Módulo II: Astronômico Constelacional" dadosAstrologia={result.dadosAstronomica.astrologia} dadosUmbanda={result.dadosAstronomica.umbanda} icon={Star} isTropical={false} onInfoClick={() => openInfoModal('astronomica')} />

      {!analiseIa && onSolicitarAnalise && (
        <div className="flex justify-center mt-10 mb-8 w-full border-t border-slate-200 pt-10">
          <button aria-label="Solicitar Análise de IA" onClick={onSolicitarAnalise} disabled={loadingAi} className="group relative px-5 md:px-8 py-4 bg-white border border-blue-200 rounded-full flex items-center justify-center gap-3 hover:bg-blue-50 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-2xl w-full md:w-auto">
            {loadingAi ? <Sparkles className="animate-spin text-blue-600 w-4 h-4 md:w-5 md:h-5" /> : <BrainCircuit className="text-blue-600 group-hover:scale-110 transition-transform w-4 h-4 md:w-5 md:h-5" />}
            <span className="font-black tracking-wide text-slate-800 text-[9px] md:text-xs uppercase">SOLICITAR ANÁLISE PSICOLÓGICA E ESOTÉRICA POR IA</span>
          </button>
        </div>
      )}

      {analiseIa && (
        <div className="mt-8 p-5 md:p-10 bg-white/80 backdrop-blur-2xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-in slide-in-from-bottom-8 duration-500 w-full overflow-hidden">
          <h3 className="text-base md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 mb-5 md:mb-6 border-b border-slate-200 pb-3 flex items-center gap-2"><BrainCircuit className="text-blue-600 w-4 h-4 md:w-5 md:h-5 flex-shrink-0" /> Síntese do Mestre (IA)</h3>
          <div className="text-slate-700 text-xs md:text-sm lg:text-base leading-relaxed md:leading-loose space-y-3 [&_p]:text-justify [&_p]:indent-8 [&_p]:mb-3 [&_strong]:text-slate-900 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_li]:text-justify [&_h1]:text-base [&_h1]:text-left [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:text-indigo-700 [&_h2]:text-sm [&_h2]:text-left [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:text-indigo-700 [&_h3]:text-xs [&_h3]:text-left [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:text-blue-600" dangerouslySetInnerHTML={{ __html: analiseIa }} />
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [formData, setFormData] = useState({ nome: '', dataNascimento: '', horaNascimento: '', localNascimento: '' });
  const [loading, setLoading] = useState(false); const [loadingAi, setLoadingAi] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null); const [analiseIa, setAnaliseIa] = useState<string>('');
  const [modalType, setModalType] = useState<'astronomica' | 'tropical' | null>(null);

  const calcularMapa = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setAnaliseIa(''); setResult(null);
    try {
      const res = await fetch('/api/calcular', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const data = await res.json() as { success: boolean; error?: string } & ResultData;
      if (data.success) { setResult(data); } else { alert(String(data.error)); }
    } catch { alert("Erro de conexão."); }
    setLoading(false);
  };

  const solicitarAnalise = async () => {
    if (!result) return;
    setLoadingAi(true);
    try {
      const res = await fetch('/api/analisar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: result.id, dadosAstronomica: result.dadosAstronomica, dadosTropical: result.dadosTropical, dadosGlobais: result.dadosGlobais, query: result.query }) });
      const data = await res.json() as { analise?: string }; if (data.analise) setAnaliseIa(data.analise);
    } catch { alert("A Inteligência falhou."); }
    setLoadingAi(false);
  };

  const handleNovaConsulta = () => {
    setResult(null); setAnaliseIa(''); setFormData({ nome: '', dataNascimento: '', horaNascimento: '', localNascimento: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-800 font-sans flex flex-col items-center w-full overflow-x-hidden relative">
      <div className="absolute inset-0 bg-slate-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-slate-50 to-purple-50/50 -z-10 fixed"></div>
      <InfoModal type={modalType} onClose={() => setModalType(null)} />

      <div className="max-w-6xl mx-auto w-full flex flex-col items-center flex-grow p-3 sm:p-5 md:p-6">
        <header className="text-center mb-8 md:mb-10 w-full flex flex-col items-center px-2 pt-4">
          <div className="p-3 bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white mb-4"><Compass className="w-10 h-10 md:w-12 md:h-12 text-blue-600" /></div>
          <h1 className="w-full text-center font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 mb-2 uppercase text-[clamp(10px,2vw,24px)] text-balance">Diagnóstico Astrológico</h1>
          <p className="text-slate-600 text-[10px] sm:text-[11px] md:text-sm font-medium tracking-wide text-balance">Umbanda Esotérica da Raiz de Guiné <span className="text-slate-400 text-[9px] md:text-xs font-normal">(W. W. da Matta e Silva)</span></p>
        </header>

        <form onSubmit={calcularMapa} className="bg-white/60 backdrop-blur-2xl p-5 md:p-8 rounded-[2.5rem] border border-white shadow-[0_8px_32px_rgba(0,0,0,0.08)] w-full grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mb-8">
          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="nomeConsulente" className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1.5"><User className="w-3.5 h-3.5 text-blue-500" /> NOME COMPLETO</label>
            <input id="nomeConsulente" required type="text" aria-label="Nome Completo" placeholder="Ex: João da Silva" className="w-full p-3.5 pl-4 text-sm bg-white/80 text-slate-800 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition shadow-sm font-medium" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="localNascimentoInput" className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1.5"><MapPin className="w-3.5 h-3.5 text-blue-500" /> LOCAL DE NASCIMENTO <span className="normal-case text-slate-400 font-medium tracking-normal">(Cidade, Estado)</span></label>
            <LocationAutocomplete value={formData.localNascimento} onChange={(val) => setFormData({ ...formData, localNascimento: val })} />
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="dataNascimento" className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1.5"><Calendar className="w-3.5 h-3.5 text-blue-500" /> DATA DE NASCIMENTO</label>
            <input id="dataNascimento" required type="date" aria-label="Data de Nascimento" className="w-full p-3.5 pl-4 text-sm bg-white/80 text-slate-800 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition shadow-sm font-medium [color-scheme:light]" value={formData.dataNascimento} onChange={e => setFormData({ ...formData, dataNascimento: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="horaNascimento" className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1.5"><Clock className="w-3.5 h-3.5 text-blue-500" /> HORÁRIO DE NASCIMENTO <span className="normal-case text-slate-400 font-medium tracking-normal">(HH:mm)</span></label>
            <input id="horaNascimento" required type="time" aria-label="Horário de Nascimento" className="w-full p-3.5 pl-4 text-sm bg-white/80 text-slate-800 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition shadow-sm font-medium [color-scheme:light]" value={formData.horaNascimento} onChange={e => setFormData({ ...formData, horaNascimento: e.target.value })} />
          </div>

          <div className="md:col-span-2 mt-3 flex flex-col md:flex-row gap-3 w-full">
            <button type="submit" disabled={loading} aria-label="Extrair Arquitetura Sagrada" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black p-4 rounded-xl flex justify-center items-center gap-2.5 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 text-[11px] md:text-sm uppercase tracking-wider">
              {loading ? <Sparkles className="animate-spin w-4 h-4 md:w-5 md:h-5" /> : <><Compass className="w-4 h-4 md:w-5 md:h-5" /> Extrair Arquitetura Sagrada</>}
            </button>
            {result && (
              <button type="button" onClick={handleNovaConsulta} aria-label="Realizar Nova Consulta" className="flex-1 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 font-bold p-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-sm hover:shadow-md text-[10px] md:text-xs uppercase tracking-wider">
                <RotateCcw className="w-4 h-4" /> Realizar Nova Consulta
              </button>
            )}
          </div>
        </form>

        {result && <ResultView result={result} analiseIa={analiseIa} onSolicitarAnalise={solicitarAnalise} loadingAi={loadingAi} openInfoModal={setModalType} />}
      </div>
      <footer className="w-full py-5 mt-10 bg-white/40 backdrop-blur-md border-t border-white flex justify-center items-center shrink-0">
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[9px] md:text-[10px] flex items-center gap-2"><span className="opacity-70">Oráculo Celestial</span><span className="opacity-30">•</span><span className="text-blue-600">APP v{APP_VERSION}</span></p>
      </footer>
    </div>
  );
}