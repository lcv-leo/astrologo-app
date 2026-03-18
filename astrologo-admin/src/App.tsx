import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, X, HelpCircle, Mail, Send, Trash2, Star, Sun, Moon, Sparkles, BrainCircuit, Copy, Share2, Info, Wind, Hash } from 'lucide-react';

const ADMIN_VERSION = "2.03.00";

interface AstroData { astro: string; signo: string; simbolo: string; }
interface UmbandaData { posicao: string; orixa: string; simbolo: string; }
interface ModalProps { type: 'astronomica' | 'tropical' | null; onClose: () => void; }
interface EmailModalProps { isOpen: boolean; onClose: () => void; onSend: (e: string) => void; isSending: boolean; }
interface BlocoProps { titulo: string; dadosAstrologia: AstroData[]; dadosUmbanda: UmbandaData[]; icon: React.ElementType; isTropical: boolean; onInfoClick: () => void; }
interface ResultViewProps { result: Record<string, any>; analiseIa: string; openInfoModal: (t: 'astronomica' | 'tropical') => void; }

const formatarData = (dataStr: string) => {
  if (!dataStr) return ''; const p = dataStr.split('-'); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dataStr;
};

const InfoModal: React.FC<ModalProps> = ({ type, onClose }) => {
  if (!type) return null;
  const content = type === 'astronomica' ? {
    titulo: "Astrologia Astronômica", icon: <Star className="w-6 h-6 text-amber-500" />, borderColor: "border-amber-300", titleColor: "text-amber-700",
    texto: `<p>A <strong>Astrologia Astronômica Constelacional</strong> rompe com as convenções sazonais. Ela se baseia no <strong>mapa real e físico do céu</strong> no minuto exato do seu nascimento, descontando a Precessão dos Equinócios e inserindo a 13ª constelação: <strong>Ophiuchus</strong>.</p>`
  } : {
    titulo: "Astrologia Tropical", icon: <Sun className="w-6 h-6 text-orange-500" />, borderColor: "border-orange-300", titleColor: "text-orange-700",
    texto: `<p>A <strong>Astrologia Tropical</strong> (ou Sazonal) não mapeia o céu estrelado, mas sim os ciclos e ritmos do nosso planeta. Funciona como um impecável <em>relógio psicológico</em> da sua <strong>Persona Terrena</strong>.</p>`
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`bg-white/90 backdrop-blur-2xl border ${content.borderColor} p-6 md:p-8 rounded-3xl max-w-2xl w-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative`}>
        <button onClick={onClose} aria-label="Fechar Informações" title="Fechar" className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition"><X className="w-5 h-5 text-slate-500" /></button>
        <h2 className={`text-2xl md:text-3xl font-black ${content.titleColor} flex items-center gap-3 mb-6 border-b border-slate-200 pb-4`}>{content.icon} {content.titulo}</h2>
        <div className="text-slate-700 text-sm md:text-base leading-relaxed space-y-4 [&_p]:text-justify" dangerouslySetInnerHTML={{ __html: content.texto }} />
        <button onClick={onClose} aria-label="Compreendido" className="mt-8 w-full py-4 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold uppercase tracking-wider transition border border-slate-200">Compreendido</button>
      </div>
    </div>
  );
};

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, onSend, isSending }) => {
  const [email, setEmail] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-2xl border border-rose-200 p-6 md:p-8 rounded-3xl max-w-md w-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative">
        <button onClick={onClose} disabled={isSending} aria-label="Fechar E-mail" title="Fechar" className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition disabled:opacity-50"><X className="w-5 h-5 text-slate-500" /></button>
        <h2 className="text-xl md:text-2xl font-black text-rose-600 flex items-center gap-3 mb-4"><Mail className="w-6 h-6" /> Enviar Dossiê</h2>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">Insira o e-mail do consulente para enviar o relatório diretamente da Câmara do Mestre.</p>
        <label htmlFor="emailAdmin" className="sr-only">Endereço de E-mail</label>
        <input type="email" id="emailAdmin" aria-label="E-mail Consulente" title="E-mail" placeholder="usuario@email.com" className="w-full p-4 bg-white text-slate-800 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none mb-6 shadow-sm" value={email} onChange={e => setEmail(e.target.value)} disabled={isSending} />
        <button onClick={() => { if (email.includes('@')) onSend(email); }} disabled={isSending || !email.includes('@')} aria-label="Transmitir E-mail" title="Disparar E-mail" className="w-full bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-700 hover:to-red-600 text-white font-bold p-4 rounded-xl flex justify-center items-center gap-3 transition-all disabled:opacity-50 uppercase tracking-wider shadow-lg shadow-rose-500/30">
          {isSending ? <Sparkles className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />} Transmitir
        </button>
      </div>
    </div>
  );
};

const RenderBlocoAstrologico: React.FC<BlocoProps> = ({ titulo, dadosAstrologia, dadosUmbanda, icon: Icon, isTropical, onInfoClick }) => {
  const cT = isTropical ? 'orange' : 'indigo'; const cH = isTropical ? 'text-orange-600' : 'text-indigo-600'; const bgSoft = isTropical ? 'bg-orange-50' : 'bg-indigo-50';
  return (
    <div className={`mt-10 pt-10 border-t border-${cT}-200 animate-in slide-in-from-top-4 w-full`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className={`text-2xl md:text-3xl font-black flex items-center gap-3 ${cH}`}><Icon className="w-8 h-8 flex-shrink-0" /> <span className="leading-tight text-balance">{titulo}</span></h2>
        <button onClick={onInfoClick} aria-label="Saiba Mais" title="Saiba Mais" className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-bold uppercase shadow-sm bg-white border-${cT}-200 ${cH} hover:bg-${cT}-50`}><HelpCircle className="w-4 h-4" /> Saiba mais</button>
      </div>
      <div className="bg-white/60 backdrop-blur-xl p-5 md:p-8 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] w-full mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-200 pb-3">I. Astrologia ({isTropical ? '12 Signos' : '13 Signos'})</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {dadosAstrologia.map((a, i) => <div key={i} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] text-slate-500 mb-1 font-medium">{a.astro}</p><p className="font-bold flex items-center gap-2 text-slate-800 text-xs sm:text-sm">{a.simbolo} {a.signo}</p></div>)}
        </div>
      </div>
      <div className="bg-white/60 backdrop-blur-xl p-5 md:p-8 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] w-full">
        <h3 className={`text-xl font-bold ${cH} mb-6 border-b border-slate-200 pb-4`}><Moon className="inline w-6 h-6" /> II. Umbanda</h3>
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {dadosUmbanda.map((u, i) => (
            <div key={i} className={`flex flex-col items-center justify-between p-3 md:p-5 bg-white rounded-2xl border border-slate-100 shadow-sm w-full h-full hover:shadow-md transition`}>
              <span className="text-2xl md:text-4xl mb-2">{u.simbolo}</span>
              <div className="flex items-center justify-center w-full mb-2 h-8"><p className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-slate-500 font-bold uppercase text-center leading-tight line-clamp-2 text-balance">{u.posicao}</p></div>
              <div className={`w-full mt-auto ${bgSoft} py-2 px-1 rounded-xl border border-${cT}-200`}><p className={`text-[10px] md:text-sm font-black ${cH} uppercase tracking-widest text-center truncate`}>{u.orixa}</p></div>
            </div>
          ))}
        </div>
        {!isTropical && (
          <div className="mt-6 flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] md:text-sm text-emerald-900 shadow-sm">
            <Info className="w-6 h-6 flex-shrink-0 mt-0.5 text-emerald-600" />
            <div className="flex flex-col gap-2">
              <p className="italic">A verdadeira entidade regente só pode ser atestada através da <strong>Lei de Pemba</strong> pelo Mestre de Iniciação.</p>
              <div className="text-[10px] md:text-xs text-emerald-700/80 border-t border-emerald-200/50 pt-2 mt-1 not-italic"><strong>* Entendendo as Horas:</strong> O <strong className="text-emerald-700">Período (3h)</strong> indica o Orixá da faixa horária. O <strong className="text-emerald-700">Astro</strong> revela o planeta astrológico do minuto exato.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ResultView: React.FC<ResultViewProps> = ({ result, analiseIa, openInfoModal }) => {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const gerarTextoRelatorio = () => {
    let t = `🌌 *DIAGNÓSTICO ASTROLÓGICO E ESOTÉRICO* 🌌\n\n👤 *Consulente:* ${result.query.nome}\n📍 *Local:* ${result.query.localNascimento}\n📅 *Nascimento:* ${formatarData(result.query.dataNascimento)} às ${result.query.horaNascimento}\n\n`;
    t += `🌬️ *FORÇAS GLOBAIS*\n• Tatwa: ${result.dadosGlobais.tatwa.principal} / ${result.dadosGlobais.tatwa.sub}\n• Numerologia: Expressão ${result.dadosGlobais.numerologia.expressao} | Caminho ${result.dadosGlobais.numerologia.caminhoVida} | Hora ${result.dadosGlobais.numerologia.vibracaoHora}\n\n`;
    t += `🌞 *MÓDULO I: TROPICAL SAZONAL (12 Signos)* - A Persona\n☀️ Sol: ${result.dadosTropical.astrologia[0].signo} | ⬆️ Asc: ${result.dadosTropical.astrologia[1].signo} | 🌙 Lua: ${result.dadosTropical.astrologia[2].signo} | 🔭 MC: ${result.dadosTropical.astrologia[3].signo}\n👑 Coroa: ${result.dadosTropical.umbanda[0].orixa} | 🌊 Adjuntó: ${result.dadosTropical.umbanda[1].orixa} | 🏹 Frente: ${result.dadosTropical.umbanda[2].orixa}\n🌟 Decanato: ${result.dadosTropical.umbanda[3].orixa} | ⏳ Faixa (3h): ${result.dadosTropical.umbanda[4].orixa} | 🪐 Astro: ${result.dadosTropical.umbanda[5].orixa}\n\n`;
    t += `✨ *AGORA, A VERDADE OCULTA...* ✨\n_A ilusão sazonal ficou para trás. Contemple sua verdadeira assinatura estelar:_\n\n`;
    t += `⭐ *MÓDULO II: ASTRONÔMICO CONSTELACIONAL (13 Signos)* - A Alma\n☀️ Sol: ${result.dadosAstronomica.astrologia[0].signo} | ⬆️ Asc: ${result.dadosAstronomica.astrologia[1].signo} | 🌙 Lua: ${result.dadosAstronomica.astrologia[2].signo} | 🔭 MC: ${result.dadosAstronomica.astrologia[3].signo}\n👑 Coroa: ${result.dadosAstronomica.umbanda[0].orixa} | 🌊 Adjuntó: ${result.dadosAstronomica.umbanda[1].orixa} | 🏹 Frente: ${result.dadosAstronomica.umbanda[2].orixa}\n🌟 Decanato: ${result.dadosAstronomica.umbanda[3].orixa} | ⏳ Faixa (3h): ${result.dadosAstronomica.umbanda[4].orixa} | 🪐 Astro: ${result.dadosAstronomica.umbanda[5].orixa}\n\n`;
    if (analiseIa) {
      const iaTxt = analiseIa.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<strong>(.*?)<\/strong>/gi, '*$1*').replace(/<b>(.*?)<\/b>/gi, '*$1*').replace(/<em>(.*?)<\/em>/gi, '_$1_').replace(/<i>(.*?)<\/i>/gi, '_$1_').replace(/<li>(.*?)<\/li>/gi, '• $1\n').replace(/<\/ul>/gi, '\n').replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n*$1*\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
      t += `🧠 *SÍNTESE DA INTELIGÊNCIA ARTIFICIAL*\n\n` + iaTxt.replace(/\n{3,}/g, '\n\n').trim() + `\n\n`;
    }
    t += `✨ _Gerado via Oráculo Celestial_ ✨`; return t;
  };

  const gerarHtmlRelatorio = () => {
    let h = `<div style="font-family: sans-serif; color: #1e293b; background-color: #f8fafc; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px;"><h2 style="color: #d97706; text-align: center; text-transform: uppercase;">🌌 Dossiê Astrológico</h2><p style="text-align: center; font-size: 18px; margin-bottom: 5px;"><strong>${result.query.nome}</strong></p><p style="text-align: center; font-size: 14px; color: #64748b; margin-top: 0;">${result.query.localNascimento}<br/>${formatarData(result.query.dataNascimento)} às ${result.query.horaNascimento}</p><h3 style="color: #0ea5e9; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">🌬️ Forças Globais</h3><p><strong>Tatwa Principal:</strong> ${result.dadosGlobais.tatwa.principal} <br/><strong>Sub-tatwa:</strong> ${result.dadosGlobais.tatwa.sub}</p><p><strong>Numerologia:</strong> Expressão ${result.dadosGlobais.numerologia.expressao} | Caminho ${result.dadosGlobais.numerologia.caminhoVida} | Hora ${result.dadosGlobais.numerologia.vibracaoHora}</p>`;
    const extrairHtml = (titulo: string, dados: Record<string, any>, cor: string) => {
      return `<h3 style="color: ${cor}; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 25px;">${titulo}</h3><p><strong>Astros:</strong> Sol em ${dados.astrologia[0].signo} | Asc em ${dados.astrologia[1].signo} | Lua em ${dados.astrologia[2].signo} | MC em ${dados.astrologia[3].signo}</p><p><strong>Umbanda:</strong> Coroa: ${dados.umbanda[0].orixa} | Adjuntó: ${dados.umbanda[1].orixa} | Frente: ${dados.umbanda[2].orixa}<br/>Decanato: ${dados.umbanda[3].orixa} | Faixa (3h): ${dados.umbanda[4].orixa} | Astro: ${dados.umbanda[5].orixa}</p>`;
    };
    h += extrairHtml("🌞 Módulo I: Tropical Sazonal (A Persona)", result.dadosTropical, "#ea580c");
    h += `<div style="text-align: center; margin: 30px 0; padding: 20px; border: 1px solid #c7d2fe; background-color: #e0e7ff; border-radius: 12px;"><h3 style="color: #4f46e5; margin-top: 0; margin-bottom: 8px; text-transform: uppercase;">✨ A Verdade Oculta ✨</h3><p style="color: #475569; font-size: 14px; margin: 0;">A ilusão sazonal ficou para trás. Contemple a sua assinatura estelar.</p></div>`;
    h += extrairHtml("⭐ Módulo II: Astronômico Constelacional (A Alma)", result.dadosAstronomica, "#d97706");
    if (analiseIa) { h += `<h3 style="color: #8b5cf6; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 30px;">🧠 Síntese da Inteligência Artificial</h3><div style="line-height: 1.6; color: #334155; text-align: justify;">${analiseIa}</div>`; }
    h += `<p style="text-align:center; font-size: 12px; color:#94a3b8; margin-top:30px; border-top: 1px solid #e2e8f0; padding-top: 15px;"><em>Gerado via Oráculo Celestial</em></p></div>`; return h;
  };

  const copiar = () => { navigator.clipboard.writeText(gerarTextoRelatorio()); alert("Dossiê copiado para a memória!"); };
  const whatsapp = () => { window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(gerarTextoRelatorio())}`, '_blank'); };
  const dispararEmail = async (emailDestino: string) => {
    setSendingEmail(true);
    try {
      const res = await fetch('[https://mapa-astral.lcv.app.br/api/enviar-email](https://mapa-astral.lcv.app.br/api/enviar-email)', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emailDestino, relatorioHtml: gerarHtmlRelatorio(), relatorioTexto: gerarTextoRelatorio(), nomeConsulente: result.query.nome }) });
      const data = await res.json() as Record<string, any>; if (data.success) { alert(String(data.message)); setEmailModalOpen(false); } else { alert(String(data.error)); }
    } catch { alert("Falha na ponte do e-mail."); }
    setSendingEmail(false);
  };

  return (
    <div className="w-full animate-in fade-in duration-700 max-w-5xl mx-auto mt-8">
      <EmailModal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} onSend={dispararEmail} isSending={sendingEmail} />

      <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10">
        <button onClick={copiar} aria-label="Copiar Tudo" title="Copiar Tudo" className="flex-1 min-w-[140px] max-w-[200px] flex items-center justify-center gap-2 bg-white text-slate-700 hover:bg-slate-50 px-4 py-3 rounded-full transition-all text-[11px] md:text-sm font-bold uppercase tracking-wider border border-slate-200 shadow-sm hover:shadow-md"><Copy className="w-4 h-4" /> Copiar Tudo</button>
        <button onClick={whatsapp} aria-label="Compartilhar no WhatsApp" title="WhatsApp" className="flex-1 min-w-[140px] max-w-[200px] flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-4 py-3 rounded-full transition-all text-[11px] md:text-sm font-bold uppercase tracking-wider border border-emerald-200 shadow-sm hover:shadow-md"><Share2 className="w-4 h-4" /> WhatsApp</button>
        <button onClick={() => setEmailModalOpen(true)} aria-label="Enviar por E-mail" title="E-mail" className="flex-1 min-w-[140px] max-w-[200px] flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-3 rounded-full transition-all text-[11px] md:text-sm font-bold uppercase tracking-wider border border-blue-200 shadow-sm hover:shadow-md"><Mail className="w-4 h-4" /> E-mail</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6 w-full mb-8">
        <div className="bg-white/70 backdrop-blur-2xl p-5 md:p-8 rounded-[2rem] border border-white shadow-sm w-full flex flex-col justify-center min-w-0">
          <h3 className="text-lg md:text-xl font-bold text-rose-600 mb-6 flex items-center gap-2 border-b border-slate-200 pb-3"><Wind className="text-rose-500 w-5 h-5" /> Forças Globais: Tatwas</h3>
          <div className="space-y-3"><div className="bg-white/80 p-3 md:p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm"><p className="text-[11px] md:text-xs text-slate-500">Principal</p><p className="font-bold text-slate-800 text-sm md:text-base truncate pl-2">{String(result.dadosGlobais.tatwa.principal)}</p></div><div className="bg-white/80 p-3 md:p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm"><p className="text-[11px] md:text-xs text-slate-500">Sub-tatwa</p><p className="font-bold text-slate-800 text-sm md:text-base truncate pl-2">{String(result.dadosGlobais.tatwa.sub)}</p></div></div>
        </div>
        <div className="bg-white/70 backdrop-blur-2xl p-5 md:p-8 rounded-[2rem] border border-white shadow-sm w-full flex flex-col justify-center min-w-0">
          <h3 className="text-lg md:text-xl font-bold text-rose-600 mb-6 flex items-center gap-2 border-b border-slate-200 pb-3"><Hash className="text-rose-500 w-5 h-5" /> Forças Globais: Numerologia</h3>
          <div className="space-y-3"><div className="flex justify-between items-center bg-white/80 p-3 rounded-xl border border-slate-100 shadow-sm"><span className="text-[11px] md:text-xs text-slate-500">Expressão</span><strong className="text-sm md:text-base text-slate-800">{String(result.dadosGlobais.numerologia.expressao)}</strong></div><div className="flex justify-between items-center bg-white/80 p-3 rounded-xl border border-slate-100 shadow-sm"><span className="text-[11px] md:text-xs text-slate-500">Caminho</span><strong className="text-sm md:text-base text-slate-800">{String(result.dadosGlobais.numerologia.caminhoVida)}</strong></div><div className="flex justify-between items-center bg-white/80 p-3 rounded-xl border border-slate-100 shadow-sm"><span className="text-[11px] md:text-xs text-slate-500">Hora</span><strong className="text-sm md:text-base text-slate-800">{String(result.dadosGlobais.numerologia.vibracaoHora)}</strong></div></div>
        </div>
      </div>

      <RenderBlocoAstrologico titulo="Módulo I: Astrológico Tropical" dadosAstrologia={result.dadosTropical.astrologia} dadosUmbanda={result.dadosTropical.umbanda} icon={Sun} isTropical={true} onInfoClick={() => openInfoModal('tropical')} />

      <div className="w-full my-12 relative group max-w-5xl mx-auto animate-in zoom-in duration-1000">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-200/50 via-purple-200/50 to-indigo-200/50 rounded-[3rem] blur-2xl transition-all group-hover:via-purple-300/50"></div>
        <div className="relative w-full bg-white/80 backdrop-blur-2xl border border-white/50 py-8 px-6 md:px-10 rounded-[2.5rem] shadow-[0_8px_32px_rgba(99,102,241,0.15)] flex flex-col items-center justify-center text-center overflow-hidden">
          <Sparkles className="w-10 h-10 text-rose-500 flex-shrink-0 animate-pulse mb-3" />
          <div className="flex flex-col items-center max-w-2xl"><h4 className="text-rose-600 font-black uppercase tracking-widest text-sm md:text-xl mb-2">✨ Agora, a Verdade Oculta! ✨</h4><p className="text-slate-600 text-xs md:text-base leading-relaxed text-balance">O módulo tradicional revelou a sua <strong>máscara terrena (Persona)</strong>. Desfaça a ilusão sazonal e contemple abaixo a sua <strong>verdadeira assinatura estelar</strong>.</p></div>
        </div>
      </div>

      <RenderBlocoAstrologico titulo="Módulo II: Astronômico Constelacional" dadosAstrologia={result.dadosAstronomica.astrologia} dadosUmbanda={result.dadosAstronomica.umbanda} icon={Star} isTropical={false} onInfoClick={() => openInfoModal('astronomica')} />

      {analiseIa && (
        <div className="mt-10 p-6 md:p-12 bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-in slide-in-from-bottom-8 duration-500 w-full overflow-hidden">
          <h3 className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-indigo-600 mb-6 md:mb-8 border-b border-slate-200 pb-4 flex items-center gap-3"><BrainCircuit className="text-rose-500 w-6 h-6 md:w-8 md:h-8 flex-shrink-0" /> Síntese do Mestre (IA)</h3>
          <div className="text-slate-700 text-sm md:text-base lg:text-lg leading-relaxed md:leading-loose space-y-4" dangerouslySetInnerHTML={{ __html: analiseIa }} />
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [lista, setLista] = useState<Array<Record<string, any>>>([]);
  const [selectedMap, setSelectedMap] = useState<Record<string, any> | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalType, setModalType] = useState<'astronomica' | 'tropical' | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchDados = async () => {
      setLoadingList(true);
      try {
        const res = await fetch(`/api/admin/listar`);
        const data = await res.json() as Record<string, any>;
        if (data.success && mounted) { setLista(data.mapas); }
      } catch { console.error("Erro na busca de registros."); }
      if (mounted) setLoadingList(false);
    };
    void fetchDados();
    return () => { mounted = false; };
  }, []);

  const recarregarManual = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/admin/listar`);
      const data = await res.json() as Record<string, any>;
      if (data.success) { setLista(data.mapas); }
    } catch { console.error("Erro de conexão."); }
    setIsRefreshing(false);
  };

  const carregarMapa = async (id: string) => {
    try {
      const res = await fetch('/api/admin/ler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const data = await res.json() as Record<string, any>;
      if (data.success) {
        const m = data.mapa;
        setSelectedMap({
          id: m.id, query: { nome: m.nome, dataNascimento: m.data_nascimento, horaNascimento: m.hora_nascimento, localNascimento: m.local_nascimento },
          dadosGlobais: JSON.parse(m.dados_globais), dadosAstronomica: JSON.parse(m.dados_astronomica), dadosTropical: JSON.parse(m.dados_tropical), analiseIa: m.analise_ia || ''
        });
      }
    } catch { alert("Falha ao abrir os registros."); }
  };

  const deletarMapa = async (id: string, nome: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Confirma a exclusão permanente de ${nome}?`)) return;
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/excluir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const data = await res.json() as Record<string, any>;
      if (data.success) { setLista(prev => prev.filter(item => item.id !== id)); if (selectedMap?.id === id) setSelectedMap(null); }
      else { alert(String(data.error) || "Erro ao tentar excluir."); }
    } catch { alert("Falha de conexão."); }
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-800 font-sans flex flex-col items-center w-full overflow-x-hidden relative">
      <div className="absolute inset-0 bg-slate-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-100/40 via-slate-50 to-indigo-100/40 -z-10 fixed"></div>
      <InfoModal type={modalType} onClose={() => setModalType(null)} />

      <div className="max-w-6xl mx-auto w-full flex flex-col items-center flex-grow p-3 sm:p-6 md:p-8">
        <header className="text-center mb-10 md:mb-14 w-full flex flex-col items-center px-2 pt-4 animate-in fade-in slide-in-from-top-4">
          <div className="p-4 bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white mb-6"><Database className="w-12 h-12 md:w-16 md:h-16 text-rose-600" /></div>
          <h1 className="w-full text-center font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-rose-700 to-red-600 mb-3 uppercase text-[clamp(20px,4vw,48px)] text-balance">Santuário Mestre</h1>
          <p className="text-slate-600 text-xs sm:text-sm md:text-lg font-medium tracking-wide text-balance">Acesso Protegido via Cloudflare Zero Trust</p>
        </header>

        {loadingList ? (
          <div className="flex flex-col items-center justify-center p-12 w-full mt-10 animate-in fade-in">
            <Sparkles className="w-12 h-12 text-rose-500 animate-spin mb-4" />
            <p className="text-rose-600 font-bold uppercase tracking-widest text-sm">Decodificando Registros...</p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center max-w-5xl animate-in fade-in">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl border border-white rounded-[2.5rem] overflow-hidden mb-8 shadow-sm flex flex-col">
              <div className="bg-rose-50 p-5 text-sm font-bold text-rose-700 border-b border-rose-100 uppercase tracking-widest flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2"><Database className="w-5 h-5" /> Arquivo Akáshico</div>
              </div>

              <ul className="max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full divide-y divide-slate-100">
                {lista.map(item => (
                  <li key={item.id} className="flex items-stretch hover:bg-rose-50/50 group transition-colors">
                    <button onClick={() => carregarMapa(item.id)} aria-label={`Carregar mapa de ${item.nome}`} title="Carregar Registro" className="flex-grow text-left px-6 py-5 text-slate-700 font-medium text-sm flex justify-between items-center overflow-hidden outline-none">
                      <span className="truncate pr-2 text-slate-800 font-bold">{item.nome} <span className="text-slate-300 mx-2 font-normal">|</span> <span className="text-rose-500/80 group-hover:text-rose-600 font-medium">{formatarData(item.data_nascimento)}</span></span>
                    </button>
                    <button onClick={(e) => deletarMapa(item.id, item.nome, e)} aria-label="Apagar Registro" title="Apagar Registro" className="px-6 py-5 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-50 md:opacity-0 md:group-hover:opacity-100 transition-all outline-none flex-shrink-0"><Trash2 className="w-5 h-5" /></button>
                  </li>
                ))}
                {lista.length === 0 && <li className="p-8 text-center text-slate-400 text-sm font-medium">O vazio sideral... Nenhum registro.</li>}
              </ul>

              <div className="bg-slate-50/90 p-5 flex justify-between items-center border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Total: <strong className="text-rose-600 text-sm ml-1">{lista.length}</strong></span>
                <button onClick={recarregarManual} disabled={isRefreshing} aria-label="Atualizar Lista" title="Atualizar Lista" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-rose-600 hover:bg-rose-50 border border-slate-200 transition-all text-xs font-bold uppercase tracking-wider disabled:opacity-50 shadow-sm hover:shadow-md"><RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Atualizar</button>
              </div>
            </div>

            {selectedMap && (
              <div className="w-full border-t border-slate-200 pt-10 mt-6 animate-in slide-in-from-bottom-6">
                <h2 className="text-center text-xl md:text-2xl text-slate-800 font-bold mb-10 bg-white/60 backdrop-blur-xl p-5 px-8 rounded-[2rem] border border-white shadow-sm inline-flex items-center justify-center mx-auto gap-3 text-balance">
                  Ficha Oculta: <span className="text-rose-600 font-black">{selectedMap.query.nome}</span>
                </h2>
                <ResultView result={selectedMap} analiseIa={selectedMap.analiseIa} openInfoModal={setModalType} />
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="w-full py-6 mt-12 bg-white/40 backdrop-blur-md border-t border-white/60 flex justify-center items-center shrink-0">
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs flex items-center gap-2"><span className="opacity-70">Oráculo Celestial</span><span className="opacity-30">•</span><span className="text-rose-600">ADMIN v{ADMIN_VERSION}</span></p>
      </footer>
    </div>
  );
}