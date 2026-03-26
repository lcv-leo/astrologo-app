import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotification } from './components/Notification';
import { Database, RefreshCw, Trash2, Star, Sun, Moon, Sparkles, Wind, Hash, BrainCircuit, Mail, Share2, Copy, Send, ShieldAlert, Save } from 'lucide-react';
import DOMPurify from 'dompurify';
import './App.css';

const ADMIN_VERSION = "2.15.1";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (value: string): boolean => emailRegex.test(value.trim());
const sanitizeRichHtml = (html: string): string => DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['p', 'strong', 'ul', 'li', 'em', 'b', 'i', 'h1', 'h2', 'h3', 'br'],
  ALLOWED_ATTR: []
});

interface AstroData { astro: string; signo: string; simbolo: string; }
interface UmbandaData { posicao: string; orixa: string; simbolo: string; }
interface DadosGlobais { tatwa: { principal: string; sub: string; }; numerologia: { expressao: number; caminhoVida: number; vibracaoHora: number; }; }
interface DadosSistema { astrologia: AstroData[]; umbanda: UmbandaData[]; }
interface ResultData { id: string; query: { nome: string; localNascimento: string; dataNascimento: string; horaNascimento: string; }; dadosGlobais: DadosGlobais; dadosAstronomica: DadosSistema; dadosTropical: DadosSistema; analiseIa?: string; }
interface ListMapData { id: string; nome: string; data_nascimento: string; }
interface BlocoProps { titulo: string; dadosAstrologia: AstroData[]; dadosUmbanda: UmbandaData[]; icon: React.ElementType; isTropical: boolean; }
interface ResultViewProps { result: ResultData; analiseIa: string; }
interface ConfirmConfig { show: boolean; id: string; nome: string; }
interface EmailModalProps { isOpen: boolean; onClose: () => void; onSend: (email: string) => void; isSending: boolean; }
interface RateLimitPolicy { route: 'astrologo/calcular' | 'astrologo/analisar' | 'astrologo/enviar-email'; enabled: boolean; max_requests: number; window_minutes: number; }

const routeLabel: Record<RateLimitPolicy['route'], string> = {
  'astrologo/calcular': 'Cálculo do Mapa',
  'astrologo/analisar': 'Síntese da IA',
  'astrologo/enviar-email': 'Envio de E-mail'
};

const defaultPolicies: Record<RateLimitPolicy['route'], Pick<RateLimitPolicy, 'enabled' | 'max_requests' | 'window_minutes'>> = {
  'astrologo/calcular': { enabled: true, max_requests: 10, window_minutes: 10 },
  'astrologo/analisar': { enabled: true, max_requests: 6, window_minutes: 15 },
  'astrologo/enviar-email': { enabled: true, max_requests: 4, window_minutes: 60 }
};

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

/* ─── Confirm Dialog ─── */
const GlassConfirm: React.FC<{ config: ConfirmConfig; onConfirm: (id: string) => void; onCancel: () => void }> = ({ config, onConfirm, onCancel }) => {
  if (!config.show) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ textAlign: 'center' }}>
        <div className="modal-icon-circle modal-icon-red"><Trash2 /></div>
        <h2 className="modal-title">Atenção Crítica</h2>
        <p className="modal-text">Você está prestes a expurgar o registro de <br /><strong>{config.nome}</strong>. Esta ação não poderá ser desfeita.</p>
        <div className="modal-actions">
          <button onClick={onCancel} className="modal-btn-cancel">Cancelar</button>
          <button onClick={() => onConfirm(config.id)} className="modal-btn-danger">Apagar</button>
        </div>
      </div>
    </div>
  );
};

/* ─── Email Modal ─── */
const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, onSend, isSending }) => {
  const [email, setEmail] = useState('');
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-card modal-card-lg">
        <button onClick={onClose} disabled={isSending} aria-label="Fechar Modal E-mail" title="Fechar" className="modal-close-btn"><Trash2 /></button>
        <h2 className="modal-email-title"><Mail /> Enviar Dossiê Celestial</h2>
        <p className="modal-email-text">Insira o endereço de e-mail para receber o relatório astrológico completo e a análise da IA.</p>
        <label htmlFor="emailConsulente" className="sr-only">Endereço de E-mail</label>
        <input type="email" id="emailConsulente" name="email" autoComplete="email" placeholder="usuario@email.com" className="modal-email-input" value={email} onChange={e => setEmail(e.target.value)} disabled={isSending} />
        <button onClick={() => { if (isValidEmail(email)) onSend(email.trim()); }} disabled={isSending || !isValidEmail(email)} aria-label="Disparar E-mail" className="modal-email-send">
          {isSending ? <Sparkles className="animate-spin" /> : <Send />} {isSending ? 'Transmitindo...' : 'Disparar E-mail'}
        </button>
      </div>
    </div>
  );
};

/* ─── Bloco Astrológico ─── */
const RenderBlocoAstrologico: React.FC<BlocoProps> = ({ titulo, dadosAstrologia, dadosUmbanda, icon: Icon, isTropical }) => {
  const colorClass = isTropical ? 'color-tropical' : 'color-sidereal';
  const blockBorder = isTropical ? 'astro-block-tropical' : 'astro-block-sidereal';
  const orixaBox = isTropical ? 'umbanda-orixa-box-tropical' : 'umbanda-orixa-box-sidereal';

  return (
    <div className={`astro-block ${blockBorder}`}>
      <h2 className={`astro-block-title ${colorClass}`}><Icon /> <span>{titulo}</span></h2>

      <div className="astro-section-card">
        <h3 className="astro-section-heading" style={{ color: '#0d0d0d' }}>I. Astrologia ({isTropical ? '12 Signos' : '13 Signos'})</h3>
        <div className="astro-grid-4">
          {dadosAstrologia.map((a, i) => (
            <div key={i} className="astro-cell">
              <p className="astro-cell-label">{a.astro}</p>
              <p className="astro-cell-value">{a.simbolo} {a.signo}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="astro-section-card">
        <h3 className={`astro-section-heading ${colorClass}`}><Moon style={{ display: 'inline', width: 20, height: 20, verticalAlign: 'text-bottom', marginRight: 8 }} />II. Umbanda</h3>
        <div className="umbanda-grid">
          {dadosUmbanda.map((u, i) => (
            <div key={i} className="umbanda-cell">
              <span className="umbanda-symbol">{u.simbolo}</span>
              <div className="umbanda-pos-wrap"><p className="umbanda-pos-label">{formatPosicaoLabel(u.posicao)}</p></div>
              <div className={`umbanda-orixa-box ${orixaBox}`}><p className={`umbanda-orixa-name ${colorClass}`}>{u.orixa}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Result View ─── */
const ResultView: React.FC<ResultViewProps> = ({ result, analiseIa }) => {
  return (
    <div className="result-container">
      <div className="forces-grid">
        <div className="force-card">
          <h3 className="force-card-title"><Wind /> Forças Globais: Tatwas</h3>
          <div className="force-items">
            <div className="force-item"><p className="force-item-label">Principal</p><p className="force-item-value">{String(result.dadosGlobais.tatwa.principal)}</p></div>
            <div className="force-item"><p className="force-item-label">Sub-tatwa</p><p className="force-item-value">{String(result.dadosGlobais.tatwa.sub)}</p></div>
          </div>
        </div>
        <div className="force-card">
          <h3 className="force-card-title"><Hash /> Forças Globais: Numerologia</h3>
          <div className="force-items">
            <div className="force-item"><span className="force-item-label">Expressão</span><strong className="force-item-value">{String(result.dadosGlobais.numerologia.expressao)}</strong></div>
            <div className="force-item"><span className="force-item-label">Caminho</span><strong className="force-item-value">{String(result.dadosGlobais.numerologia.caminhoVida)}</strong></div>
            <div className="force-item"><span className="force-item-label">Hora</span><strong className="force-item-value">{String(result.dadosGlobais.numerologia.vibracaoHora)}</strong></div>
          </div>
        </div>
      </div>

      <RenderBlocoAstrologico titulo="Módulo I: Astrológico Tropical" dadosAstrologia={result.dadosTropical.astrologia} dadosUmbanda={result.dadosTropical.umbanda} icon={Sun} isTropical={true} />

      <div className="transition-banner">
        <div className="transition-banner-glow"></div>
        <div className="transition-banner-inner">
          <Sparkles />
          <h4 className="transition-banner-title">✨ Agora, a Verdade Oculta! ✨</h4>
          <p className="transition-banner-text">O módulo tropical acima revelou a sua <strong>máscara terrena (Persona)</strong>. Desfaça a ilusão sazonal e contemple abaixo a sua <strong>verdadeira assinatura estelar</strong>.</p>
        </div>
      </div>

      <RenderBlocoAstrologico titulo="Módulo II: Astronômico Constelacional" dadosAstrologia={result.dadosAstronomica.astrologia} dadosUmbanda={result.dadosAstronomica.umbanda} icon={Star} isTropical={false} />

      {analiseIa && (
        <div className="ia-card">
          <h3 className="ia-card-title"><BrainCircuit /> Síntese do Mestre (IA)</h3>
          <div className="ia-content" dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(analiseIa) }} />
        </div>
      )}
    </div>
  );
};

/* ─── Main App ─── */
export default function App() {
  const [lista, setLista] = useState<ListMapData[]>([]);
  const [selectedMap, setSelectedMap] = useState<ResultData | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showNotification } = useNotification();
  const [confirmDialog, setConfirmDialog] = useState<ConfirmConfig>({ show: false, id: '', nome: '' });
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [ratePolicies, setRatePolicies] = useState<RateLimitPolicy[]>([]);
  const [baselinePolicies, setBaselinePolicies] = useState<RateLimitPolicy[]>([]);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [savingPolicies, setSavingPolicies] = useState(false);

  const hasUnsavedPolicies = useMemo(() => {
    const normalize = (items: RateLimitPolicy[]) => [...items]
      .sort((a, b) => a.route.localeCompare(b.route))
      .map((p) => ({
        route: p.route,
        enabled: p.enabled,
        max_requests: Number(p.max_requests),
        window_minutes: Number(p.window_minutes)
      }));

    return JSON.stringify(normalize(ratePolicies)) !== JSON.stringify(normalize(baselinePolicies));
  }, [ratePolicies, baselinePolicies]);

  useEffect(() => {
    if (!hasUnsavedPolicies) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedPolicies]);

  const carregarPoliticas = useCallback(async (): Promise<void> => {
    setLoadingPolicies(true);
    try {
      const res = await fetch('/api/admin/rate-limit-listar');
      const data = await res.json() as { success: boolean; policies?: Array<Record<string, unknown>>; error?: string };
      if (!data.success || !Array.isArray(data.policies)) {
        throw new Error(data.error || 'Falha ao carregar políticas.');
      }
      const parsed = data.policies
        .map((p) => ({
          route: String(p.route) as RateLimitPolicy['route'],
          enabled: Number(p.enabled) !== 0,
          max_requests: Math.max(1, Number(p.max_requests) || 1),
          window_minutes: Math.max(1, Number(p.window_minutes) || 1)
        }))
        .filter((p) => p.route === 'astrologo/calcular' || p.route === 'astrologo/analisar' || p.route === 'astrologo/enviar-email')
        .sort((a, b) => {
          const order: Record<RateLimitPolicy['route'], number> = { 'astrologo/calcular': 1, 'astrologo/analisar': 2, 'astrologo/enviar-email': 3 };
          return order[a.route] - order[b.route];
        });

      setRatePolicies(parsed);
      setBaselinePolicies(parsed);
    } catch {
      showNotification('Falha ao carregar controle de rate limit.', 'error');
    } finally {
      setLoadingPolicies(false);
    }
  }, [showNotification]);

  const salvarPoliticas = async (): Promise<void> => {
    setSavingPolicies(true);
    try {
      const payload = {
        policies: ratePolicies.map((p) => ({
          route: p.route,
          enabled: p.enabled,
          max_requests: Math.max(1, Math.min(500, Number(p.max_requests) || 1)),
          window_minutes: Math.max(1, Math.min(1440, Number(p.window_minutes) || 1))
        }))
      };

      const res = await fetch('/api/admin/rate-limit-salvar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (!data.success) {
        throw new Error(data.error || 'Não foi possível salvar.');
      }

      showNotification('Escudo de rate limit atualizado.', 'success');
      await carregarPoliticas();
    } catch {
      showNotification('Falha ao salvar políticas de rate limit.', 'error');
    } finally {
      setSavingPolicies(false);
    }
  };

  const atualizarPolitica = (route: RateLimitPolicy['route'], patch: Partial<RateLimitPolicy>) => {
    setRatePolicies((prev) => prev.map((policy) => (policy.route === route ? { ...policy, ...patch } : policy)));
  };

  const restaurarPadrao = (route: RateLimitPolicy['route']) => {
    const baseline = defaultPolicies[route];
    atualizarPolitica(route, {
      enabled: baseline.enabled,
      max_requests: baseline.max_requests,
      window_minutes: baseline.window_minutes
    });
  };

  const restaurarTodosPadroes = () => {
    setRatePolicies((prev) => prev.map((policy) => ({
      ...policy,
      ...defaultPolicies[policy.route]
    })));
    showNotification('Padrões restaurados para todas as rotas.', 'info');
  };

  useEffect(() => {
    let mounted = true;
    const fetchDados = async () => {
      setLoadingList(true);
      try {
        const res = await fetch(`/api/admin/listar`);
        const data = await res.json() as { success: boolean; mapas: ListMapData[]; error?: string };
        if (data.success && mounted) { setLista(data.mapas); }
      } catch { showNotification("Erro na busca de registros.", "error"); }
      finally { if (mounted) setLoadingList(false); }
    };
    void fetchDados();
    void carregarPoliticas();
    return () => { mounted = false; };
  }, [showNotification, carregarPoliticas]);

  const recarregarManual = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/admin/listar`);
      const data = await res.json() as { success: boolean; mapas: ListMapData[]; error?: string };
      if (data.success) { setLista(data.mapas); showNotification("Registros sincronizados com o Akasha.", "success"); }
    } catch { showNotification("Falha de conexão com o banco.", "error"); }
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
    } catch { showNotification("Falha ao abrir os registros ocultos.", "error"); }
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
        showNotification("Registro expurgado permanentemente.", "success");
      } else { showNotification(String(data.error), "error"); }
    } catch { showNotification("Falha de conexão com a nuvem.", "error"); }
    finally { setIsRefreshing(false); }
  };

  const gerarTextoRelatorio = (): string => {
    if (!selectedMap) return '';
    const divider = '\n' + '─'.repeat(28) + '\n';
    let t = `*🌌 DIAGNÓSTICO ASTROLÓGICO E ESOTÉRICO 🌌*\n\n`;
    t += `*Consulente:* ${selectedMap.query.nome}\n`;
    t += `*Local:* ${selectedMap.query.localNascimento}\n`;
    t += `*Nascimento:* ${formatarData(selectedMap.query.dataNascimento)} às ${selectedMap.query.horaNascimento}\n`;
    t += divider;
    t += `*🌬️ FORÇAS GLOBAIS*\n\n`;
    t += `*Tatwas:*\n`;
    t += `  • Principal: *${selectedMap.dadosGlobais.tatwa.principal}*\n`;
    t += `  • Sub-tatwa: *${selectedMap.dadosGlobais.tatwa.sub}*\n\n`;
    t += `*Numerologia:*\n`;
    t += `  • Expressão: *${selectedMap.dadosGlobais.numerologia.expressao}*\n`;
    t += `  • Caminho da Vida: *${selectedMap.dadosGlobais.numerologia.caminhoVida}*\n`;
    t += `  • Vibração da Hora: *${selectedMap.dadosGlobais.numerologia.vibracaoHora}*\n`;
    const blocoTexto = (dados: DadosSistema) => {
        let texto = `\n*Astrologia:*\n`;
        texto += `  • ☀️ Sol: *${dados.astrologia[0].signo}*\n`;
        texto += `  • ⬆️ Ascendente: *${dados.astrologia[1].signo}*\n`;
        texto += `  • 🌙 Lua: *${dados.astrologia[2].signo}*\n`;
        texto += `  • 🔭 Meio do Céu: *${dados.astrologia[3].signo}*\n\n`;
        texto += `*Umbanda:*\n`;
        texto += `  • 👑 Coroa (Orixá Ancestral): *${dados.umbanda[0].orixa}*\n`;
        texto += `  • 🌊 Adjuntó (Orixá de Frente): *${dados.umbanda[1].orixa}*\n`;
        texto += `  • 🏹 Frente (Orixá de Trabalho): *${dados.umbanda[2].orixa}*\n`;
        texto += `  • 🌟 Decanato (Regente Secundário): *${dados.umbanda[3].orixa}*\n`;
        texto += `  • ⏳ Faixa Horária (Regente da Hora): *${dados.umbanda[4].orixa}*\n`;
        texto += `  • 🪐 ${formatPosicaoLabel(dados.umbanda[5].posicao)}: *${dados.umbanda[5].orixa}*\n`;
        return texto;
    };
    t += divider;
    t += `*🌞 MÓDULO I: ASTROLÓGICO TROPICAL (A PERSONA)*\n`;
    t += blocoTexto(selectedMap.dadosTropical);
    t += divider;
    t += `*✨ AGORA, A VERDADE OCULTA... ✨*\n\n`;
    t += `_O módulo tropical acima revelou a sua máscara terrena (Persona). Desfaça a ilusão sazonal e contemple abaixo a sua *verdadeira assinatura estelar*._\n`;
    t += divider;
    t += `*⭐ MÓDULO II: ASTRONÔMICO CONSTELACIONAL (A ALMA)*\n`;
    t += blocoTexto(selectedMap.dadosAstronomica);
    if (selectedMap.analiseIa) {
      const iaTxt = selectedMap.analiseIa.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<strong>(.*?)<\/strong>/gi, '*$1*').replace(/<b>(.*?)<\/b>/gi, '*$1*').replace(/<em>(.*?)<\/em>/gi, '_$1_').replace(/<i>(.*?)<\/i>/gi, '_$1_').replace(/<li>(.*?)<\/li>/gi, '• $1\n').replace(/<\/ul>/gi, '\n').replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n*$1*\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
      t += divider;
      t += `*🧠 SÍNTESE DO MESTRE (IA)*\n\n` + iaTxt.replace(/\n{3,}/g, '\n\n').trim() + `\n`;
    }
    t += divider;
    t += `✨ _Gerado via Oráculo Celestial v${ADMIN_VERSION}_ ✨`;
    return t;
  };

  const gerarHtmlRelatorio = (): string => {
    if (!selectedMap) return '';
    const fontFamily = "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;";
    const boxShadow = "box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.05);";
    const blocoAstrologiaHtml = (dados: AstroData[]) => dados.map(a => `
      <div style="background-color: #ffffff; padding: 12px; border-radius: 12px; border: 1px solid #f1f5f9; ${boxShadow} text-align: left;">
        <p style="font-size: 11px; color: #64748b; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">${a.astro}</p>
        <p style="font-size: 15px; color: #1e293b; margin: 0; font-weight: bold;">${a.simbolo} ${a.signo}</p>
      </div>
    `).join('');
    const blocoUmbandaHtml = (dados: UmbandaData[], isTropical: boolean) => {
      const color = isTropical ? '#ea580c' : '#4f46e5';
      const bgColor = isTropical ? 'rgba(251, 146, 60, 0.1)' : 'rgba(99, 102, 241, 0.1)';
      const borderColor = isTropical ? '#fed7aa' : '#c7d2fe';
      return dados.map(u => `
        <div style="background-color: #ffffff; padding: 12px; border-radius: 12px; border: 1px solid #f1f5f9; ${boxShadow} display: flex; flex-direction: column; align-items: center; justify-content: space-between; height: 100%; text-align: center;">
          <span style="font-size: 32px; margin-bottom: 8px;">${u.simbolo}</span>
          <p style="font-size: 10px; color: #64748b; margin: 0 0 8px 0; font-weight: bold; text-transform: uppercase; line-height: 1.2;">${formatPosicaoLabel(u.posicao)}</p>
          <div style="background-color: ${bgColor}; color: ${color}; border: 1px solid ${borderColor}; border-radius: 8px; padding: 8px 4px; width: 100%; margin-top: auto;">
            <p style="margin: 0; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">${u.orixa}</p>
          </div>
        </div>
      `).join('');
    };
    const renderBlocoAstrologicoEmail = (titulo: string, dadosAstrologia: AstroData[], dadosUmbanda: UmbandaData[], isTropical: boolean) => {
        const titleColor = isTropical ? '#f97316' : '#4338ca';
        const borderColor = isTropical ? '#fb923c' : '#6366f1';
        return `
            <div style="margin-top: 40px; padding-top: 40px; border-top: 1px solid ${borderColor};">
                <h2 style="font-size: 28px; font-weight: 900; color: ${titleColor}; margin: 0 0 32px 0;">${titulo}</h2>
                <div style="background-color: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); padding: 32px; border-radius: 24px; border: 1px solid #ffffff; ${boxShadow} margin-bottom: 32px;">
                    <h3 style="font-size: 20px; font-weight: bold; color: #1e293b; margin: 0 0 24px 0; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">I. Astrologia (${isTropical ? '12 Signos' : '13 Signos'})</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px;">
                        ${blocoAstrologiaHtml(dadosAstrologia)}
                    </div>
                </div>
                <div style="background-color: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); padding: 32px; border-radius: 24px; border: 1px solid #ffffff; ${boxShadow}">
                    <h3 style="font-size: 20px; font-weight: bold; color: ${titleColor}; margin: 0 0 24px 0; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">II. Umbanda</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                        ${blocoUmbandaHtml(dadosUmbanda, isTropical)}
                    </div>
                </div>
            </div>
        `;
    };
    const analiseSanitizada = selectedMap?.analiseIa ? sanitizeRichHtml(selectedMap.analiseIa) : '';

    const h = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dossiê Astrológico</title>
        <style>
          @media (max-width: 600px) {
            .container { padding: 15px !important; }
            .grid-2 { grid-template-columns: 1fr !important; }
          }
        </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; ${fontFamily}">
        <div class="container" style="background-color: #f1f5f9; background-image: radial-gradient(ellipse at top, #e0e7ff 0%, #f1f5f9 50%, #fdf4ff 100%); max-width: 800px; margin: auto; padding: 40px;">
            <header style="text-align: center; margin-bottom: 40px;">
                <h1 style="font-size: 36px; font-weight: 900; letter-spacing: -1px; color: transparent; background-clip: text; -webkit-background-clip: text; background-image: linear-gradient(to right, #3b82f6, #6366f1); margin: 0 0 8px 0;">Diagnóstico Astrológico</h1>
                <p style="font-size: 18px; color: #475569; margin: 0;">Umbanda Esotérica da Raiz de Guiné</p>
            </header>
            <div style="background-color: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); padding: 32px; border-radius: 24px; border: 1px solid #ffffff; ${boxShadow} text-align: center; margin-bottom: 40px;">
                <h2 style="font-size: 24px; font-weight: 800; color: #1e293b; margin: 0 0 8px 0;">${selectedMap.query.nome}</h2>
                <p style="font-size: 16px; color: #475569; margin: 0;">${selectedMap.query.localNascimento}</p>
                <p style="font-size: 16px; color: #475569; margin: 0;">${formatarData(selectedMap.query.dataNascimento)} às ${selectedMap.query.horaNascimento}</p>
            </div>
            <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px;">
                <div style="background-color: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); padding: 24px; border-radius: 24px; border: 1px solid #ffffff; ${boxShadow}">
                    <h3 style="font-size: 20px; font-weight: bold; color: #2563eb; margin: 0 0 16px 0; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">🌬️ Forças Globais: Tatwas</h3>
                    <div style="font-size: 16px; color: #334155;">
                        <div style="display: flex; justify-content: space-between; padding: 12px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 8px;"><span>Principal</span> <strong style="color: #1e293b;">${selectedMap.dadosGlobais.tatwa.principal}</strong></div>
                        <div style="display: flex; justify-content: space-between; padding: 12px; background-color: #f8fafc; border-radius: 8px;"><span>Sub-tatwa</span> <strong style="color: #1e293b;">${selectedMap.dadosGlobais.tatwa.sub}</strong></div>
                    </div>
                </div>
                <div style="background-color: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); padding: 24px; border-radius: 24px; border: 1px solid #ffffff; ${boxShadow}">
                    <h3 style="font-size: 20px; font-weight: bold; color: #2563eb; margin: 0 0 16px 0; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">#️⃣ Forças Globais: Numerologia</h3>
                     <div style="font-size: 16px; color: #334155;">
                        <div style="display: flex; justify-content: space-between; padding: 12px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 8px;"><span>Expressão</span> <strong style="color: #1e293b;">${selectedMap.dadosGlobais.numerologia.expressao}</strong></div>
                        <div style="display: flex; justify-content: space-between; padding: 12px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 8px;"><span>Caminho</span> <strong style="color: #1e293b;">${selectedMap.dadosGlobais.numerologia.caminhoVida}</strong></div>
                        <div style="display: flex; justify-content: space-between; padding: 12px; background-color: #f8fafc; border-radius: 8px;"><span>Hora</span> <strong style="color: #1e293b;">${selectedMap.dadosGlobais.numerologia.vibracaoHora}</strong></div>
                    </div>
                </div>
            </div>
            ${renderBlocoAstrologicoEmail("Módulo I: Astrológico Tropical", selectedMap.dadosTropical.astrologia, selectedMap.dadosTropical.umbanda, true)}
            <div style="margin: 60px 0; text-align: center; position: relative;">
              <div style="position: absolute; inset: 0; background-image: linear-gradient(to right, rgba(251, 146, 60, 0.2), rgba(99, 102, 241, 0.2), rgba(52, 211, 153, 0.2)); border-radius: 24px; filter: blur(20px);"></div>
              <div style="position: relative; background-color: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.5); padding: 40px; border-radius: 24px; ${boxShadow}">
                  <p style="font-size: 32px; margin: 0 0 12px 0;">✨</p>
                  <h3 style="font-size: 24px; font-weight: 900; color: #4f46e5; margin: 0 0 8px 0;">Agora, a Verdade Oculta!</h3>
                  <p style="font-size: 16px; color: #475569; margin: 0; max-width: 500px; margin-left: auto; margin-right: auto;">O módulo tropical acima revelou a sua <strong>máscara terrena (Persona)</strong>. Desfaça a ilusão sazonal e contemple abaixo a sua <strong>verdadeira assinatura estelar</strong>.</p>
              </div>
            </div>
            ${renderBlocoAstrologicoEmail("Módulo II: Astronômico Constelacional", selectedMap.dadosAstronomica.astrologia, selectedMap.dadosAstronomica.umbanda, false)}
            ${analiseSanitizada ? `
            <div style="margin-top: 60px; padding: 40px; background-color: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border-radius: 24px; border: 1px solid #ffffff; ${boxShadow}">
                <h3 style="font-size: 28px; font-weight: 900; color: transparent; background-clip: text; -webkit-background-clip: text; background-image: linear-gradient(to right, #3b82f6, #4f46e5); margin: 0 0 24px 0; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">🧠 Síntese do Mestre (IA)</h3>
              <div style="font-size: 16px; line-height: 1.7; color: #334155;">${analiseSanitizada}</div>
            </div>
            ` : ''}
            <footer style="text-align: center; margin-top: 60px; padding-top: 20px; border-top: 1px solid #dde4ee;">
                <p style="font-size: 12px; color: #64748b; margin: 0;">Gerado via Oráculo Celestial v${ADMIN_VERSION}</p>
            </footer>
        </div>
    </body>
    </html>
    `;
    return h;
  };

  const copiar = () => { navigator.clipboard.writeText(gerarTextoRelatorio()); showNotification("Dossiê copiado para a memória!", 'success'); };
  const whatsapp = () => { window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(gerarTextoRelatorio())}`, '_blank'); };
  const dispararEmail = async (emailDestino: string) => {
    setSendingEmail(true);
    try {
      const res = await fetch('/api/admin/enviar-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emailDestino, relatorioHtml: gerarHtmlRelatorio(), relatorioTexto: gerarTextoRelatorio(), nomeConsulente: selectedMap?.query.nome }) });
      const data = await res.json() as { success: boolean; message?: string; error?: string };
      if (data.success) { showNotification(String(data.message), 'success'); setEmailModalOpen(false); } else { showNotification(String(data.error), 'error'); }
    } catch { showNotification("Falha na ponte do e-mail.", 'error'); }
    setSendingEmail(false);
  };

  return (
    <div className="app-shell">
      {/* Background Orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      <GlassConfirm config={confirmDialog} onConfirm={executarExclusao} onCancel={() => setConfirmDialog({ ...confirmDialog, show: false })} />
      {selectedMap && <EmailModal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} onSend={dispararEmail} isSending={sendingEmail} />}

      <div className="app-content">
        <header className="app-header">
          <div className="header-icon-box"><Database /></div>
          <h1 className="app-title">CÂMARA DO MESTRE</h1>
        </header>

        {loadingList ? (
          <div className="loading-container">
            <Sparkles className="animate-spin" />
            <p className="loading-text">Decodificando Registros...</p>
          </div>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 1000 }}>
            {/* Akashic List */}
            <div className="card-tiptap card-tiptap-wide" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="akashic-header">
                <div className="akashic-title"><Database /> <span>Arquivo Akáshico</span></div>
                <button onClick={recarregarManual} disabled={isRefreshing} aria-label="Atualizar Lista" className="btn-pill">
                  <RefreshCw className={isRefreshing ? 'animate-spin' : ''} style={{ width: 14, height: 14 }} /> ATUALIZAR
                </button>
              </div>

              <ul className="akashic-list">
                {lista.map(item => {
                  const isSelected = selectedMap?.id === item.id;
                  return (
                  <li key={item.id} className={`akashic-item ${isSelected ? 'akashic-item-selected' : ''}`}>
                    <button onClick={() => carregarMapa(item.id)} aria-label={`Carregar mapa de ${item.nome}`} className="akashic-item-btn">
                      <span>
                        <span className="akashic-item-name">{item.nome}</span>
                        <span className="akashic-item-sep">|</span>
                        <span className="akashic-item-date">{formatarData(item.data_nascimento)}</span>
                      </span>
                    </button>
                    <button onClick={(e) => deletarMapa(item.id, item.nome, e)} aria-label="Apagar Registro" className="akashic-delete-btn"><Trash2 /></button>
                  </li>
                  );
                })}
                {lista.length === 0 && <li className="akashic-empty">O vazio sideral... Nenhum registro.</li>}
              </ul>

              <div className="akashic-footer">
                <span className="akashic-total">Total: <strong>{lista.length}</strong></span>
              </div>
            </div>

            {/* Rate Limit Section */}
            <div className="card-tiptap card-tiptap-wide" style={{ padding: '20px' }}>
              <div className="rate-section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <h3 className="rate-section-title"><ShieldAlert /> Segurança e Custos (Limitação de API)</h3>
                  {hasUnsavedPolicies && <span className="rate-unsaved-badge">Alterações não salvas</span>}
                </div>
                <div className="rate-section-actions">
                  <button onClick={restaurarTodosPadroes} disabled={savingPolicies || loadingPolicies || ratePolicies.length === 0} className="btn-rate-restore" title="Restaurar padrão para todas as rotas">Restaurar padrão (todas)</button>
                  <button onClick={salvarPoliticas} disabled={savingPolicies || loadingPolicies || ratePolicies.length === 0 || !hasUnsavedPolicies} className="btn-rate-save"><Save /> {savingPolicies ? 'Salvando...' : 'Salvar'}</button>
                </div>
              </div>

              <div className="rate-policies">
                {loadingPolicies ? (
                  <div style={{ fontSize: 13, color: '#514b48', padding: 12 }}>Sincronizando políticas...</div>
                ) : ratePolicies.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#514b48', padding: 12 }}>Nenhuma política encontrada.</div>
                ) : ratePolicies.map((policy) => (
                  <div key={policy.route} className="rate-card">
                    <div className="rate-card-header">
                      <label htmlFor={`policy-enabled-${policy.route}`} className="rate-toggle-label">
                        <input id={`policy-enabled-${policy.route}`} name={`policyEnabled_${policy.route}`} type="checkbox" autoComplete="off" checked={policy.enabled} onChange={(e) => atualizarPolitica(policy.route, { enabled: e.target.checked })} />
                        <span>Habilitar Escudo ({routeLabel[policy.route]})</span>
                      </label>
                      <button type="button" onClick={() => restaurarPadrao(policy.route)} className="btn-rate-restore" title={`Restaurar padrão para ${routeLabel[policy.route]}`}>Restaurar padrão</button>
                    </div>

                    <p className="rate-description">Quando ativo, bloqueia temporariamente excessos de requisição por IP nesta rota.</p>

                    <div className="rate-status-pill">
                      <span className={`rate-dot ${policy.enabled ? 'rate-dot-on' : 'rate-dot-off'}`} />
                      <span>{policy.enabled ? 'Ativo' : 'Inativo'}</span>
                      <span style={{ color: 'rgba(220,38,38,0.4)' }}>•</span>
                      <span>{policy.max_requests} req / {policy.window_minutes} min</span>
                    </div>

                    <div className="rate-inputs">
                      <div>
                        <label htmlFor={`policy-max-requests-${policy.route}`} className="rate-input-label">Máx. requisições por IP</label>
                        <input id={`policy-max-requests-${policy.route}`} name={`policyMaxRequests_${policy.route}`} type="number" min={1} max={500} autoComplete="off" inputMode="numeric" title={`Máximo de requisições por IP para ${routeLabel[policy.route]}`} placeholder="Ex: 10" value={policy.max_requests} onChange={(e) => atualizarPolitica(policy.route, { max_requests: Math.max(1, Number(e.target.value) || 1) })} className="rate-input-field" />
                      </div>
                      <div>
                        <label htmlFor={`policy-window-minutes-${policy.route}`} className="rate-input-label">Janela (minutos)</label>
                        <input id={`policy-window-minutes-${policy.route}`} name={`policyWindowMinutes_${policy.route}`} type="number" min={1} max={1440} autoComplete="off" inputMode="numeric" title={`Janela em minutos para ${routeLabel[policy.route]}`} placeholder="Ex: 15" value={policy.window_minutes} onChange={(e) => atualizarPolitica(policy.route, { window_minutes: Math.max(1, Number(e.target.value) || 1) })} className="rate-input-field" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Map Result */}
            {selectedMap && (
              <div className="result-separator" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="result-header">
                  <h2 className="result-header-badge">
                    Ficha Oculta: <span className="result-header-name">{selectedMap.query.nome}</span>
                  </h2>
                </div>
                <div className="result-actions">
                    <button onClick={copiar} aria-label="Copiar Tudo" title="Copiar Tudo" className="btn-action"><Copy /> Copiar Tudo</button>
                    <button onClick={whatsapp} aria-label="Compartilhar no WhatsApp" title="WhatsApp" className="btn-action btn-action-emerald"><Share2 /> WhatsApp</button>
                    <button onClick={() => setEmailModalOpen(true)} aria-label="Enviar por E-mail" title="E-mail" className="btn-action btn-action-blue"><Mail /> E-mail</button>
                </div>
                <ResultView result={selectedMap} analiseIa={selectedMap.analiseIa || ''} />
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="app-footer">
        <span className="footer-version"><span className="footer-version-accent">ADMIN v{ADMIN_VERSION}</span></span>
      </footer>
    </div>
  );
}