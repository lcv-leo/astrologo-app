import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Trash2, Star, Sun, Moon, Sparkles, BrainCircuit, Wind, Hash } from 'lucide-react';

const ADMIN_VERSION = "2.07.00";

interface AstroData { astro: string; signo: string; simbolo: string; }
interface UmbandaData { posicao: string; orixa: string; simbolo: string; }
interface DadosGlobais { tatwa: { principal: string; sub: string; }; numerologia: { expressao: number; caminhoVida: number; vibracaoHora: number; }; }
interface DadosSistema { astrologia: AstroData[]; umbanda: UmbandaData[]; }
interface ResultData { id: string; query: { nome: string; localNascimento: string; dataNascimento: string; horaNascimento: string; }; dadosGlobais: DadosGlobais; dadosAstronomica: DadosSistema; dadosTropical: DadosSistema; analiseIa?: string; }
interface ListMapData { id: string; nome: string; data_nascimento: string; }
interface BlocoProps { titulo: string; dadosAstrologia: AstroData[]; dadosUmbanda: UmbandaData[]; icon: React.ElementType; isTropical: boolean; }
interface ResultViewProps { result: ResultData; analiseIa: string; }

const formatarData = (dataStr: string): string => {
  if (!dataStr) return ''; const p = dataStr.split('-'); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dataStr;
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
      </div>
    </div>
  );
};

const ResultView: React.FC<ResultViewProps> = ({ result, analiseIa }) => {
  return (
    <div className="w-full animate-in fade-in duration-700 max-w-5xl mx-auto mt-8">
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

      <RenderBlocoAstrologico titulo="Módulo I: Astrológico Tropical" dadosAstrologia={result.dadosTropical.astrologia} dadosUmbanda={result.dadosTropical.umbanda} icon={Sun} isTropical={true} />

      <div className="w-full my-12 relative group max-w-5xl mx-auto animate-in zoom-in duration-1000">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-200/50 via-purple-200/50 to-indigo-200/50 rounded-[3rem] blur-2xl transition-all group-hover:via-purple-300/50"></div>
        <div className="relative w-full bg-white/80 backdrop-blur-2xl border border-white/50 py-8 px-6 md:px-10 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center text-center overflow-hidden">
          <Sparkles className="w-10 h-10 text-rose-500 flex-shrink-0 animate-pulse mb-3" />
          <div className="flex flex-col items-center max-w-2xl"><h4 className="text-rose-600 font-black uppercase tracking-widest text-sm md:text-xl mb-2">✨ A Verdade Oculta ✨</h4><p className="text-slate-600 text-xs md:text-base leading-relaxed text-balance">O módulo tradicional revelou a sua <strong>máscara terrena (Persona)</strong>. Desfaça a ilusão sazonal e contemple abaixo a sua <strong>verdadeira assinatura estelar</strong>.</p></div>
        </div>
      </div>

      <RenderBlocoAstrologico titulo="Módulo II: Astronômico Constelacional" dadosAstrologia={result.dadosAstronomica.astrologia} dadosUmbanda={result.dadosAstronomica.umbanda} icon={Star} isTropical={false} />

      {analiseIa && (
        <div className="mt-10 p-6 md:p-12 bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-in slide-in-from-bottom-8 duration-500 w-full overflow-hidden">
          <h3 className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-purple-600 mb-6 md:mb-8 border-b border-slate-200 pb-4 flex items-center gap-3"><BrainCircuit className="text-rose-500 w-6 h-6 md:w-8 md:h-8 flex-shrink-0" /> Síntese do Mestre (IA)</h3>
          <div className="text-slate-700 text-sm md:text-base lg:text-lg leading-relaxed md:leading-loose space-y-4" dangerouslySetInnerHTML={{ __html: analiseIa }} />
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

  useEffect(() => {
    let mounted = true;
    const fetchDados = async () => {
      setLoadingList(true);
      try {
        const res = await fetch(`/api/admin/listar`);
        const data = await res.json() as { success: boolean; mapas: ListMapData[]; error?: string };
        if (data.success && mounted) { setLista(data.mapas); }
      } catch { console.error("Erro na busca de registros."); }
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
      if (data.success) { setLista(data.mapas); }
    } catch { console.error("Erro de conexão."); }
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
    } catch { alert("Falha ao abrir os registros."); }
  };

  const deletarMapa = async (id: string, nome: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Confirma a exclusão de ${nome}?`)) return;
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/excluir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) { setLista(prev => prev.filter(item => item.id !== id)); if (selectedMap?.id === id) setSelectedMap(null); }
      else { alert(String(data.error) || "Erro ao tentar excluir."); }
    } catch { alert("Falha de conexão."); }
    finally { setIsRefreshing(false); }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-800 font-sans flex flex-col items-center w-full overflow-x-hidden relative">
      <div className="absolute inset-0 bg-slate-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-100/40 via-slate-50 to-indigo-100/40 -z-10 fixed"></div>

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
                <ResultView result={selectedMap} analiseIa={selectedMap.analiseIa || ''} />
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="w-full py-6 mt-12 bg-white/40 backdrop-blur-md border-t border-white/60 flex justify-center items-center shrink-0">
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs flex items-center gap-2"><span className="text-rose-600">ADMIN v{ADMIN_VERSION}</span></p>
      </footer>
    </div>
  );
}