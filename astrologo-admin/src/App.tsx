import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Trash2, Star, Sun, Moon, Sparkles, Wind, Hash, X, CheckCircle2, AlertCircle, BrainCircuit } from 'lucide-react';

const ADMIN_VERSION = "2.11.00";

interface AstroData { astro: string; signo: string; simbolo: string; }
interface UmbandaData { posicao: string; orixa: string; simbolo: string; }
interface DadosGlobais { tatwa: { principal: string; sub: string; }; numerologia: { expressao: number; caminhoVida: number; vibracaoHora: number; }; }
interface DadosSistema { astrologia: AstroData[]; umbanda: UmbandaData[]; }
interface ResultData { id: string; query: { nome: string; localNascimento: string; dataNascimento: string; horaNascimento: string; }; dadosGlobais: DadosGlobais; dadosAstronomica: DadosSistema; dadosTropical: DadosSistema; analiseIa?: string; }
interface ListMapData { id: string; nome: string; data_nascimento: string; }
interface BlocoProps { titulo: string; dadosAstrologia: AstroData[]; dadosUmbanda: UmbandaData[]; icon: React.ElementType; isTropical: boolean; }
interface ResultViewProps { result: ResultData; analiseIa: string; }
interface NotificationConfig { show: boolean; type: 'success' | 'error'; message: string; }
interface ConfirmConfig { show: boolean; id: string; nome: string; }

const formatarData = (dataStr: string): string => {
  if (!dataStr) return ''; const p = dataStr.split('-'); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dataStr;
};

const formatPosicaoLabel = (pos: string): string => {
  const p = pos.toUpperCase();
  if (p.includes('FAIXA') || p.includes('PERÍODO')) return 'FAIXA HORÁRIA (3H)';
  if (p.startsWith('HORA PLANETÁRIA')) return p;
  if (p.includes('ASTRO')) {
    const match = p.match(/\((.*?)\)/);
    return match ? `HORA PLANETÁRIA (${match[1].trim()})` : 'HORA PLANETÁRIA (ASTRO)';
  }
  return p;
};

const GlassToast: React.FC<{ config: NotificationConfig; onClose: () => void }> = ({ config, onClose }) => {
  useEffect(() => {
    if (config.show) { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }
  }, [config.show, onClose]);

  if (!config.show) return null;
  const isErr = config.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-[999999] animate-in slide-in-from-bottom-8 fade-in duration-300">
      <div className={`bg-white/90 backdrop-blur-2xl border ${isErr ? 'border-red-200 text-red-600' : 'border-emerald-200 text-emerald-600'} p-4 px-6 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-sm md:text-base`}>
        {isErr ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
        <span>{config.message}</span>
        <button onClick={onClose} className="ml-4 text-slate-400 hover:text-slate-600" title="OK" aria-label="Fechar Notificação"><X className="w-4 h-4" /></button>
      </div>
    </div>
  );
};

const GlassConfirm: React.FC<{ config: ConfirmConfig; onConfirm: (id: string) => void; onCancel: () => void }> = ({ config, onConfirm, onCancel }) => {
  if (!config.show) return null;
  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-2xl border border-blue-200 p-6 md:p-8 rounded-[2rem] max-w-sm w-full shadow-2xl relative text-center">
        <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-5"><Trash2 className="w-8 h-8 text-red-600" /></div>
        <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-2">Atenção Crítica</h2>
        <p className="text-slate-600 text-sm md:text-base mb-8 leading-relaxed">Você está prestes a expurgar o registro de <br /><strong>{config.nome}</strong>. Esta ação não poderá ser desfeita.</p>
        <div className="flex gap-3 w-full">
          <button onClick={onCancel} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold uppercase tracking-wider text-sm transition">Cancelar</button>
          <button onClick={() => onConfirm(config.id)} className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase tracking-wider text-sm transition shadow-lg shadow-red-500/30">Apagar</button>
        </div>
      </div>
    </div>
  );
};

const RenderBlocoAstrologico: React.FC<BlocoProps> = ({ titulo, dadosAstrologia, dadosUmbanda, icon: Icon, isTropical }) => {
  const cT = isTropical ? 'orange' : 'indigo'; const cH = isTropical ? 'text-orange-600' : 'text-indigo-600'; const bgSoft = isTropical ? 'bg-orange-50' : 'bg-indigo-50';
  return (
    <div className={`mt-10 pt-10 border-t border-${cT}-200 animate-in slide-in-from-top-4 w-full`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className={`text-2xl md:text-3xl font-black flex items-center gap-3 ${cH}`}><Icon className="w-8 h-8 flex-shrink-0" /> <span className="leading-tight text-balance">{titulo}</span></h2>
      </div>
      <div className="bg-white/60 backdrop-blur-xl p-5 md:p-8 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] w-full mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-200 pb-3">I. Astrologia ({isTropical ? '12 Signos' : '13 Signos'})</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {dadosAstrologia.map((a, i) => <div key={i} className="bg-white p-3 md:p-4 rounded-2xl border border-slate-100 shadow-sm"><p className="text-[10px] md:text-xs text-slate-500 mb-1 font-medium truncate">{a.astro}</p><p className="font-bold flex items-center gap-2 text-slate-800 text-xs sm:text-sm md:text-base truncate">{a.simbolo} {a.signo}</p></div>)}
        </div>
      </div>
      <div className="bg-white/60 backdrop-blur-xl p-5 md:p-8 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] w-full">
        <h3 className={`text-xl md:text-2xl font-bold ${cH} mb-6 border-b border-slate-200 pb-4`}><Moon className="inline w-6 h-6" /> II. Umbanda</h3>
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {dadosUmbanda.map((u, i) => (
            <div key={i} className={`flex flex-col items-center justify-between p-3 md:p-5 bg-white rounded-2xl border border-slate-100 shadow-sm w-full h-full hover:shadow-md transition`}>
              <span className="text-2xl md:text-4xl mb-2 md:mb-3 mt-1">{u.simbolo}</span>
              <div className="flex items-center justify-center w-full mb-2 md:mb-3 h-8 sm:h-10"><p className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-slate-500 font-bold uppercase text-center leading-tight line-clamp-2 text-balance">{formatPosicaoLabel(u.posicao)}</p></div>
              <div className={`w-full mt-auto ${bgSoft} py-2 md:py-2.5 px-1 rounded-xl border border-${cT}-200`}><p className={`text-[10px] md:text-sm font-black ${cH} uppercase tracking-widest text-center truncate`}>{u.orixa}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ResultView: React.FC<ResultViewProps> = ({ result, analiseIa }) => {
  return (
    <div className="w-full animate-in fade-in duration-700 max-w-5xl mx-auto mt-6">
      <div className="grid md:grid-cols-2 gap-4 md:gap-5 w-full mb-6">
        <div className="bg-white/70 backdrop-blur-2xl p-4 md:p-6 rounded-2xl border border-white shadow-sm w-full flex flex-col justify-center min-w-0">
          <h3 className="text-sm md:text-base font-bold text-blue-600 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2"><Wind className="text-blue-500 w-4 h-4" /> Forças Globais: Tatwas</h3>
          <div className="space-y-2"><div className="bg-white/80 p-2.5 md:p-3 rounded-lg border border-slate-100 flex justify-between items-center shadow-sm"><p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wide">Principal</p><p className="font-bold text-slate-800 text-xs md:text-sm truncate pl-2">{String(result.dadosGlobais.tatwa.principal)}</p></div><div className="bg-white/80 p-2.5 md:p-3 rounded-lg border border-slate-100 flex justify-between items-center shadow-sm"><p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wide">Sub-tatwa</p><p className="font-bold text-slate-800 text-xs md:text-sm truncate pl-2">{String(result.dadosGlobais.tatwa.sub)}</p></div></div>
        </div>
        <div className="bg-white/70 backdrop-blur-2xl p-4 md:p-6 rounded-2xl border border-white shadow-sm w-full flex flex-col justify-center min-w-0">
          <h3 className="text-sm md:text-base font-bold text-blue-600 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2"><Hash className="text-blue-500 w-4 h-4" /> Forças Globais: Numerologia</h3>
          <div className="space-y-2"><div className="flex justify-between items-center bg-white/80 p-2.5 md:p-3 rounded-lg border border-slate-100 shadow-sm"><span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wide">Expressão</span><strong className="text-xs md:text-sm text-slate-800">{String(result.dadosGlobais.numerologia.expressao)}</strong></div><div className="flex justify-between items-center bg-white/80 p-2.5 md:p-3 rounded-lg border border-slate-100 shadow-sm"><span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wide">Caminho</span><strong className="text-xs md:text-sm text-slate-800">{String(result.dadosGlobais.numerologia.caminhoVida)}</strong></div><div className="flex justify-between items-center bg-white/80 p-2.5 md:p-3 rounded-lg border border-slate-100 shadow-sm"><span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wide">Hora</span><strong className="text-xs md:text-sm text-slate-800">{String(result.dadosGlobais.numerologia.vibracaoHora)}</strong></div></div>
        </div>
      </div>

      <RenderBlocoAstrologico titulo="Módulo I: Astrológico Tropical" dadosAstrologia={result.dadosTropical.astrologia} dadosUmbanda={result.dadosTropical.umbanda} icon={Sun} isTropical={true} />

      <div className="w-full my-10 relative group max-w-4xl mx-auto animate-in zoom-in duration-1000">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-200/50 via-indigo-200/50 to-emerald-200/50 rounded-3xl blur-2xl transition-all group-hover:via-indigo-300/50"></div>
        <div className="relative w-full bg-white/80 backdrop-blur-2xl border border-white/50 py-6 px-5 md:px-8 rounded-3xl shadow-[0_8px_32px_rgba(99,102,241,0.15)] flex flex-col items-center justify-center text-center overflow-hidden">
          <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-indigo-500 flex-shrink-0 animate-pulse mb-2" />
          <div className="flex flex-col items-center max-w-xl"><h4 className="text-indigo-600 font-black uppercase tracking-widest text-[10px] md:text-sm mb-1.5">✨ Agora, a Verdade Oculta! ✨</h4><p className="text-slate-600 text-[10px] md:text-xs leading-relaxed text-balance">O módulo tropical acima revelou a sua <strong>máscara terrena (Persona)</strong>. Desfaça a ilusão sazonal e contemple abaixo a sua <strong>verdadeira assinatura estelar</strong>.</p></div>
        </div>
      </div>

      <RenderBlocoAstrologico titulo="Módulo II: Astronômico Constelacional" dadosAstrologia={result.dadosAstronomica.astrologia} dadosUmbanda={result.dadosAstronomica.umbanda} icon={Star} isTropical={false} />

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
  const [lista, setLista] = useState<ListMapData[]>([]);
  const [selectedMap, setSelectedMap] = useState<ResultData | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<NotificationConfig>({ show: false, type: 'success', message: '' });
  const [confirmDialog, setConfirmDialog] = useState<ConfirmConfig>({ show: false, id: '', nome: '' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ show: true, message, type });

  useEffect(() => {
    let mounted = true;
    const fetchDados = async () => {
      setLoadingList(true);
      try {
        const res = await fetch(`/api/admin/listar`);
        const data = await res.json() as { success: boolean; mapas: ListMapData[]; error?: string };
        if (data.success && mounted) { setLista(data.mapas); }
      } catch { showToast("Erro na busca de registros.", "error"); }
      finally { if (mounted) setLoadingList(false); }
    };
    void fetchDados();
    return () => { mounted = false; };
  }, []);

  const recarregarManual = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/admin/listar`);
      const data = await res.json() as { success: boolean; mapas: ListMapData[]; error?: string };
      if (data.success) { setLista(data.mapas); showToast("Registros sincronizados com o Akasha.", "success"); }
    } catch { showToast("Falha de conexão com o banco.", "error"); }
    finally { setIsRefreshing(false); }
  };

  const carregarMapa = async (id: string) => {
    try {
      const res = await fetch('/api/admin/ler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const data = await res.json() as { success: boolean; mapa: Record<string, string> };
      if (data.success) {
        const m = data.mapa;
        setSelectedMap({
          id: m.id, query: { nome: m.nome, localNascimento: m.local_nascimento, dataNascimento: m.data_nascimento, horaNascimento: m.hora_nascimento },
          dadosGlobais: JSON.parse(m.dados_globais) as DadosGlobais,
          dadosAstronomica: JSON.parse(m.dados_astronomica) as DadosSistema,
          dadosTropical: JSON.parse(m.dados_tropical) as DadosSistema,
          analiseIa: m.analise_ia || ''
        });
      }
    } catch { showToast("Falha ao abrir os registros ocultos.", "error"); }
  };

  const deletarMapa = async (id: string, nome: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDialog({ show: true, id, nome });
  };

  const executarExclusao = async (id: string) => {
    setConfirmDialog({ ...confirmDialog, show: false });
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/excluir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) {
        setLista(prev => prev.filter(item => item.id !== id));
        if (selectedMap?.id === id) setSelectedMap(null);
        showToast("Registro expurgado permanentemente.", "success");
      } else { showToast(String(data.error), "error"); }
    } catch { showToast("Falha de conexão com a nuvem.", "error"); }
    finally { setIsRefreshing(false); }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-800 font-sans flex flex-col items-center w-full overflow-x-hidden relative">
      <div className="absolute inset-0 bg-slate-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-slate-50 to-indigo-100/40 -z-10 fixed"></div>

      <GlassToast config={toast} onClose={() => setToast({ ...toast, show: false })} />
      <GlassConfirm config={confirmDialog} onConfirm={executarExclusao} onCancel={() => setConfirmDialog({ ...confirmDialog, show: false })} />

      <div className="max-w-6xl mx-auto w-full flex flex-col items-center flex-grow p-3 sm:p-5 md:p-6">
        <header className="text-center mb-8 md:mb-10 w-full flex flex-col items-center px-2 pt-4 animate-in fade-in slide-in-from-top-4">
          <div className="p-3 bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white mb-4"><Database className="w-10 h-10 md:w-12 md:h-12 text-blue-600" /></div>
          <h1 className="w-full text-center font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 mb-2 uppercase text-[clamp(10px,2vw,24px)] text-balance">CÂMARA DO MESTRE</h1>
        </header>

        {loadingList ? (
          <div className="flex flex-col items-center justify-center p-12 w-full mt-10 animate-in fade-in">
            <Sparkles className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-blue-600 font-bold uppercase tracking-widest text-xs">Decodificando Registros...</p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center max-w-5xl animate-in fade-in">
            <div className="w-full lg:w-max min-w-[50%] max-w-full overflow-x-auto bg-white/80 backdrop-blur-2xl border border-white rounded-[2.5rem] mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex flex-col mx-auto">

              {/* O BOTÃO DE ATUALIZAR REALOCADO PARA O CABEÇALHO */}
              <div className="bg-blue-50/80 p-4 md:p-5 px-6 border-b border-blue-100 flex items-center justify-between shadow-sm gap-4">
                <div className="flex items-center gap-2 text-sm md:text-base font-bold text-blue-700 uppercase tracking-widest flex-shrink-0"><Database className="w-4 h-4 md:w-5 md:h-5" /> <span className="whitespace-nowrap">Arquivo Akáshico</span></div>
                <button onClick={recarregarManual} disabled={isRefreshing} aria-label="Atualizar Lista" className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 border border-slate-200 transition-all text-[10px] md:text-xs font-bold uppercase tracking-wider disabled:opacity-50 shadow-sm hover:shadow-md flex-shrink-0"><RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> ATUALIZAR</button>
              </div>

              <ul className="max-h-[400px] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full divide-y divide-slate-100">
                {lista.map(item => (
                  <li key={item.id} className="flex items-stretch hover:bg-blue-50/30 group transition-colors min-w-max">
                    <button onClick={() => carregarMapa(item.id)} aria-label={`Carregar mapa de ${item.nome}`} className="flex-grow text-left px-6 py-5 text-slate-700 font-medium text-sm md:text-base flex justify-between items-center outline-none">
                      <span className="whitespace-nowrap pr-8 text-slate-800 font-bold">{item.nome} <span className="text-slate-300 mx-3 font-normal">|</span> <span className="text-blue-500/80 group-hover:text-blue-600 font-medium">{formatarData(item.data_nascimento)}</span></span>
                    </button>
                    <button onClick={(e) => deletarMapa(item.id, item.nome, e)} aria-label="Apagar Registro" className="px-6 py-5 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-50 md:opacity-0 md:group-hover:opacity-100 transition-all outline-none flex-shrink-0"><Trash2 className="w-4 h-4 md:w-5 md:h-5" /></button>
                  </li>
                ))}
                {lista.length === 0 && <li className="p-8 text-center text-slate-400 text-sm md:text-base font-medium">O vazio sideral... Nenhum registro.</li>}
              </ul>

              {/* RODAPÉ ISOLADO CONTENDO APENAS O TOTAL */}
              <div className="bg-slate-50/90 p-4 md:p-5 px-6 flex justify-start items-center border-t border-slate-100">
                <span className="text-[10px] md:text-xs font-bold text-slate-500 tracking-wide uppercase">Total: <strong className="text-blue-600 text-xs md:text-sm ml-1">{lista.length}</strong></span>
              </div>
            </div>

            {selectedMap && (
              <div className="w-full flex flex-col items-center border-t border-slate-200 pt-8 mt-4 animate-in slide-in-from-bottom-6">
                <h2 className="text-center text-lg md:text-xl text-slate-800 font-bold mb-8 bg-white/60 backdrop-blur-xl p-4 px-6 md:p-5 md:px-8 rounded-[2rem] border border-white shadow-[0_8px_32px_rgba(0,0,0,0.06)] inline-flex items-center justify-center gap-3 text-balance">
                  Ficha Oculta: <span className="text-blue-600 font-black">{selectedMap.query.nome}</span>
                </h2>
                <ResultView result={selectedMap} analiseIa={selectedMap.analiseIa || ''} />
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="w-full py-5 mt-10 bg-white/40 backdrop-blur-md border-t border-white/60 flex justify-center items-center shrink-0">
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[9px] md:text-[10px] flex items-center gap-2"><span className="text-blue-600">ADMIN v{ADMIN_VERSION}</span></p>
      </footer>
    </div>
  );
}