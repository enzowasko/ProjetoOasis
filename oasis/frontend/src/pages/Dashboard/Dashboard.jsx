import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, User, LayoutDashboard, Flame, Square, 
  Play, Pause, ChevronDown, ChevronUp, GripVertical, 
  Trash2, Edit2, Leaf, Calendar, Check, Clock, Target, Send, AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import './Dashboard.css';

// ── MÁGICA DO RPG: FUNÇÃO QUE CALCULA O NÍVEL DINAMICAMENTE ──
const calcularNivelInfo = (xpTotal) => {
  let level = 1;
  let xpRestante = xpTotal;
  let xpDoNivelAtual = 1000; 

  while (xpRestante >= xpDoNivelAtual) {
    xpRestante -= xpDoNivelAtual;
    level++;
    xpDoNivelAtual = level * 1000; 
  }

  return { 
    nivel: level, 
    xpNoNivel: xpRestante, 
    xpParaProximo: xpDoNivelAtual 
  };
};

// ── EFEITO SONORO 100% NATIVO (Sem arquivos externos) ──
const tocarBeepNativo = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return; 

  const audioCtx = new AudioContext();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = 'sine'; 
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
  oscillator.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.1); 

  gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.3);
};

export function Dashboard() {
  const navigate = useNavigate();

  const [userName, setUserName]           = useState('');
  const [xp, setXp]                       = useState(0);
  const [userId, setUserId]               = useState(null);
  const [ofensivaAtual, setOfensivaAtual] = useState(0);

  const [diaSelecionado, setDiaSelecionado] = useState(new Date().getDate());

  const [totalMissoesConcluidas, setTotalMissoesConcluidas] = useState(0);
  const [totalMinutosFoco, setTotalMinutosFoco]             = useState(0);

  // ── ESTADO DO MODAL CUSTOMIZADO (Substitui alerts e confirms) ──
  const [modal, setModal] = useState({
    aberto: false,
    tipo: 'alerta', // 'alerta' ou 'confirmacao'
    mensagem: '',
    acaoConfirmar: null
  });

  const fecharModal = () => setModal({ ...modal, aberto: false });

  const mostrarAlerta = (mensagem) => {
    setModal({ aberto: true, tipo: 'alerta', mensagem, acaoConfirmar: null });
  };

  const mostrarConfirmacao = (mensagem, acao) => {
    setModal({ aberto: true, tipo: 'confirmacao', mensagem, acaoConfirmar: acao });
  };

  useEffect(() => {
    const saved = localStorage.getItem('@Oasis:user');
    if (!saved) { 
      navigate('/login'); 
      return; 
    }
    const u = JSON.parse(saved);
    setUserName(u.nome);
    setXp(u.xp || 0);
    setUserId(u.id);
    setOfensivaAtual(u.ofensiva || 0);
  }, [navigate]);

  const [tarefaInput,  setTarefaInput]  = useState('');
  const [tempoInput,   setTempoInput]   = useState(''); 
  const [dataAgendada, setDataAgendada] = useState('');
  const [idEditando,   setIdEditando]   = useState(null); 
  
  const [tarefasPendentes, setTarefasPendentes]   = useState([]);
  const [tarefasConcluidas, setTarefasConcluidas] = useState([]);
  
  const [mostrarPendentes, setMostrarPendentes]   = useState(true);
  const [mostrarConcluidas, setMostrarConcluidas] = useState(false);

  const [isRunning,      setIsRunning]     = useState(false);
  const [totalSegundos,   setTotalSegundos] = useState(0);
  const [tempoRestante,   setTempoRestante] = useState(0);

  const idTarefaAtual = tarefasPendentes.length > 0 ? tarefasPendentes[0].id : null;
  const tempoTarefaAtual = tarefasPendentes.length > 0 ? tarefasPendentes[0].tempo_estimado : 30;

  useEffect(() => {
    setTotalSegundos(tempoTarefaAtual * 60);
    setTempoRestante(tempoTarefaAtual * 60);
    setIsRunning(false); 
  }, [idTarefaAtual]); 

  useEffect(() => {
    if (!isRunning) return;
    
    if (tempoRestante <= 0) { 
      setIsRunning(false); 
      tocarBeepNativo();
      
      if (tarefasPendentes.length > 0) {
        handleConcluir(tarefasPendentes[0].id, tarefasPendentes[0].tempo_estimado);
      }
      return; 
    }
    
    const id = setInterval(() => setTempoRestante(p => p - 1), 1000);
    return () => clearInterval(id);
  }, [isRunning, tempoRestante, tarefasPendentes]);

  const pctPassada = totalSegundos > 0 ? ((totalSegundos - tempoRestante) / totalSegundos) * 100 : 0;

  const buscarTarefas = async () => {
    if (!userId) return;
    try {
      const { data } = await api.get(`/tarefas?usuario_id=${userId}`);
      if (data) {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = hoje.getMonth(); 
        
        const dataAlvoTempo = new Date(ano, mes, diaSelecionado).getTime();

        const tarefasFoco = data.filter(t => {
          if (!t.data_agendada) return true;
          const d = new Date(t.data_agendada);
          const dataUTC = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
          const dataTarefaTempo = new Date(dataUTC.getFullYear(), dataUTC.getMonth(), dataUTC.getDate()).getTime();
          
          return dataTarefaTempo === dataAlvoTempo;
        });

        const pendentesDoDia = tarefasFoco.filter(t => !t.concluida);
        const concluidasDoDia = tarefasFoco.filter(t => t.concluida);

        setTarefasPendentes(pendentesDoDia);
        setTarefasConcluidas(concluidasDoDia);

        setTotalMissoesConcluidas(concluidasDoDia.length);
        
        const totalMinutos = concluidasDoDia.reduce((acc, t) => acc + (t.tempo_estimado || 0), 0);
        setTotalMinutosFoco(totalMinutos);
      }
    } catch (e) { 
      console.error("Erro ao buscar tarefas:", e); 
    }
  };

  useEffect(() => { buscarTarefas(); }, [userId, diaSelecionado]);

  const handleAdd = async (e) => {
    if (e && e.key !== 'Enter') return;
    if (!tarefaInput.trim()) return mostrarAlerta('Digite o nome da missão.');
    
    const tempoNumerico = Number(tempoInput);
    if (!tempoNumerico || tempoNumerico < 1) return mostrarAlerta('Por favor, informe uma duração válida (ex: 30).');
    
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const diaFormatado = String(diaSelecionado).padStart(2, '0');
    const dataContexto = `${ano}-${mes}-${diaFormatado}`;

    const dataFinal = dataAgendada || dataContexto;
    
    try {
      if (idEditando) {
        await api.put(`/tarefas/${idEditando}`, {
          nome: tarefaInput,
          tempo_estimado: tempoNumerico,
          data_agendada: dataFinal,
        });
        setIdEditando(null); 
      } else {
        await api.post('/tarefas', {
          usuario_id: userId, 
          nome: tarefaInput,
          tempo_estimado: tempoNumerico, 
          data_agendada: dataFinal,
        });
      }
      
      setTarefaInput(''); 
      setTempoInput(''); 
      setDataAgendada(''); 
      buscarTarefas();
      setMostrarPendentes(true);
    } catch (e) { 
      console.error(e); 
      mostrarAlerta('Erro ao salvar a missão.');
    }
  };

  const handleEdit = (tarefa) => {
    setTarefaInput(tarefa.nome);
    setTempoInput(tarefa.tempo_estimado || '');
    setDataAgendada(tarefa.data_agendada ? tarefa.data_agendada.split('T')[0] : '');
    setIdEditando(tarefa.id);
  };

  // ── EXCLUSÃO ATUALIZADA PARA USAR O MODAL CUSTOMIZADO ──
  const handleDeleteRequest = (id) => {
    mostrarConfirmacao('Tem certeza que deseja excluir esta missão?', () => executarExclusao(id));
  };

  const executarExclusao = async (id) => {
    fecharModal();
    try {
      await api.delete(`/tarefas/${id}`);
      if (idEditando === id) {
        setIdEditando(null);
        setTarefaInput('');
        setTempoInput('');
        setDataAgendada(''); 
      }
      buscarTarefas();
    } catch (e) {
      console.error(e);
      mostrarAlerta('Erro ao excluir a missão.');
    }
  };

  const handleConcluir = async (id, tempo) => {
    const xpGanho = tempo * 50;
    
    const tarefaFinalizada = tarefasPendentes.find(t => t.id === id);
    if (tarefaFinalizada) {
      tarefaFinalizada.concluida = true;
      setTarefasPendentes(prev => prev.filter(t => t.id !== id));
      setTarefasConcluidas(prev => [tarefaFinalizada, ...prev]);
    }

    try {
      const { data } = await api.patch(`/tarefas/${id}/concluir`, { xp_ganho: xpGanho });
      const novoXp = data.xp_atualizado;
      setXp(novoXp);
      
      const u = JSON.parse(localStorage.getItem('@Oasis:user'));
      u.xp = novoXp;
      localStorage.setItem('@Oasis:user', JSON.stringify(u));
      
      setIsRunning(false);
      buscarTarefas(); 
    } catch (e) { 
      console.error(e); 
      buscarTarefas(); 
    }
  };

  const handleToggleTimer = () => {
    if (!tarefasPendentes.length) return mostrarAlerta('Nenhuma missão pendente para focar!');
    setIsRunning(!isRunning);
  };

  const dragItem = useRef();
  const dragOverItem = useRef();

  const handleDragStart = (e, position) => { dragItem.current = position; };
  const handleDragEnter = (e, position) => { dragOverItem.current = position; };
  
  const handleDrop = () => {
    if (dragItem.current === undefined || dragOverItem.current === undefined) return;
    const copyListItems = [...tarefasPendentes];
    const dragItemContent = copyListItems[dragItem.current];
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setTarefasPendentes(copyListItems);
  };

  const formatarTempoFoco = (minutos) => {
    if (minutos < 60) return { valor: minutos, unidade: 'min' };
    const horas = (minutos / 60).toFixed(1).replace('.0', '');
    return { valor: horas, unidade: 'horas' };
  };

  const tempoFormatado = formatarTempoFoco(totalMinutosFoco);

  const RADIUS = 140;
  const CIRCUNFERENCIA = 2 * Math.PI * RADIUS;
  const strokeOffset = CIRCUNFERENCIA - ((pctPassada / 100) * CIRCUNFERENCIA);
  const diaHoje = new Date().getDate();

  const { nivel, xpNoNivel, xpParaProximo } = calcularNivelInfo(xp);
  const progressoBarraXp = (xpNoNivel / xpParaProximo) * 100;

  return (
    <div className={`dashboard-root ${isRunning ? 'zen-mode' : ''}`}>
      
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo"><Leaf size={18} color="#7DC98F" fill="currentColor" /></div>
          <span className="brand-text">O Á S I S</span>
        </div>

        <div className="user-card">
          <div className="user-header">
            <div className="user-avatar">{userName.substring(0, 2).toUpperCase() || 'US'}</div>
            <div className="user-info">
              <h3>{userName || 'Explorador'}</h3>
              <p>Explorador Nível {nivel}</p>
            </div>
          </div>
          <div className="user-xp">
            <div className="xp-text">
              <span>Progresso de Nível</span>
              <span className="xp-values"><strong className="text-amber">{xpNoNivel.toLocaleString('pt-BR')}</strong> / {xpParaProximo.toLocaleString('pt-BR')}</span>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${Math.min(progressoBarraXp, 100)}%` }} />
            </div>
            <div className="xp-levels">
              <span>Lv. {nivel}</span>
              <span>Lv. {nivel + 1}</span>
            </div>
          </div>
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon-wrapper time-glow">
              <Clock size={20} color="#0284C7" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{tempoFormatado.valor} <span className="stat-unit">{tempoFormatado.unidade}</span></span>
              <span className="stat-label">Tempo de Foco</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper task-glow">
              <Target size={20} color="#15803D" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{totalMissoesConcluidas} <span className="stat-unit">missões</span></span>
              <span className="stat-label">Total Concluídas</span>
            </div>
          </div>
        </div>

        <div className="calendar-widget sidebar-calendar">
          <div className="cal-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 className="cal-title">CALENDÁRIO</h4>
              <h5 className="cal-month">Junho 2026</h5>
            </div>
            <button className="action-btn" title="Expandir" onClick={() => navigate('/calendario')}>
              <Calendar size={16} />
            </button>
          </div>
          
          <div className="cal-grid">
            {['D','S','T','Q','Q','S','S'].map((d, i) => <span key={i} className="cal-day">{d}</span>)}
            <span className="cal-date" />
            {Array.from({length: 30}, (_, i) => i + 1).map(n => {
              const isToday = n === diaHoje;
              const isSelected = n === diaSelecionado;
              return (
                <span 
                  key={n} 
                  className={`cal-date ${isToday ? 'today' : ''} ${isSelected && !isToday ? 'selected-day' : ''}`}
                  onClick={() => setDiaSelecionado(n)}
                  style={{ cursor: 'pointer' }}
                >
                  {n}
                </span>
              );
            })}
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="greeting">
            <span className="greeting-sub">FOCO DO DIA {String(diaSelecionado).padStart(2, '0')}</span>
            <h1 className="greeting-title">Olá, {userName || 'Visitante'}</h1>
          </div>
          <div className="top-actions">
            <div className="streak-pill">
              <Flame size={14} fill="#C4A24A" color="#C4A24A" />
              <span>Sua Ofensiva: <strong>{ofensivaAtual} Dias</strong></span>
            </div>
            
            <div className="top-nav-links">
              <button className="top-text-btn active" onClick={() => navigate('/dashboard')}>
                <LayoutDashboard size={16} /> <span>Dashboard</span>
              </button>
              <button className="top-text-btn" onClick={() => navigate('/calendario')}>
                <Calendar size={16} /> <span>Calendário</span>
              </button>
              <button className="top-text-btn" onClick={() => navigate('/ranking')}>
                <Trophy size={16} /> <span>Ranking</span>
              </button>
            </div>

            <button className="icon-btn profile-btn" title="Perfil" onClick={() => navigate('/perfil')}>
              <User size={18} />
            </button>
          </div>
        </header>

        <div className="content-split">
          <section className="focus-section">
            <div className="focus-label">
              {tarefasPendentes[0]?.nome.toUpperCase() || 'MISSÃO'}
            </div>
            
            <div className={`focus-circle-wrapper ${isRunning ? 'is-running' : ''}`}>
              <svg className="progress-ring" viewBox="0 0 340 340">
                <defs>
                  <linearGradient id="focus-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7DC98F" />
                    <stop offset="100%" stopColor="#16261D" />
                  </linearGradient>
                </defs>

                <circle cx="170" cy="170" r={RADIUS + 14} fill="none" stroke="#DCE6E0" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />
                <circle cx="170" cy="170" r={RADIUS} fill="none" stroke="#E8EDEA" strokeWidth="12" />

                <circle 
                  cx="170" cy="170" r={RADIUS} 
                  fill="none" stroke="url(#focus-gradient)" strokeWidth="12" 
                  strokeLinecap="round"
                  strokeDasharray={CIRCUNFERENCIA} 
                  strokeDashoffset={strokeOffset}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
            </div>

            <button 
              className={`main-action-btn ${isRunning ? 'is-running' : ''}`} 
              onClick={handleToggleTimer}
            >
              {isRunning ? <><Pause size={20} /> Pausar Foco</> : <><Play size={20} /> Iniciar Foco</>}
            </button>
          </section>

          <aside className="side-panel">
            <div className="missions-header">
              <div className="missions-title-group">
                <h3>MISSÕES (DIA {String(diaSelecionado).padStart(2, '0')})</h3>
              </div>
            </div>

            <div className="missions-crud">
              {idEditando && (
                <div className="edit-badge">
                  <span>Editando Missão</span>
                  <button onClick={() => { setIdEditando(null); setTarefaInput(''); setDataAgendada(''); setTempoInput(''); }}>Cancelar</button>
                </div>
              )}

              <div className="new-mission-wrapper interactive-el">
                <input 
                  type="text" 
                  className="new-mission-input-bare" 
                  placeholder={idEditando ? "Editando..." : "Nova missão"} 
                  value={tarefaInput}
                  onChange={(e) => setTarefaInput(e.target.value)}
                  onKeyDown={handleAdd}
                />
                <button 
                  className="submit-mission-btn" 
                  onClick={() => handleAdd()} 
                  title="Adicionar Missão"
                >
                  <Send size={16} />
                </button>
              </div>

              <div className="mission-filters">
                <div className="filter-group">
                  <span className="filter-label">Duração (Minutos)</span>
                  <input 
                    type="number" 
                    min="1"
                    className="filter-select interactive-el"
                    value={tempoInput} 
                    onChange={(e) => setTempoInput(e.target.value)}
                    placeholder="Tempo" 
                  />
                </div>
                
                <div className="filter-group">
                  <span className="filter-label">Data alternativa</span>
                  <input 
                    type="date" 
                    className="filter-select date-select interactive-el" 
                    value={dataAgendada}
                    onChange={(e) => setDataAgendada(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="list-section">
              <div className="list-toggle" onClick={() => setMostrarPendentes(!mostrarPendentes)}>
                <span>Pendentes ({tarefasPendentes.length})</span>
                {mostrarPendentes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {mostrarPendentes && (
                <div className="task-list">
                  {tarefasPendentes.length === 0 && (
                    <p className="empty-message">Nenhuma missão pendente para este dia.</p>
                  )}
                  {tarefasPendentes.map((t, index) => (
                    <div 
                      key={t.id} 
                      className={`task-card draggable-card ${index === 0 ? 'active' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnter={(e) => handleDragEnter(e, index)}
                      onDragEnd={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <div className="drag-handle" title="Arraste para reordenar">
                        <GripVertical size={16} />
                      </div>
                      
                      <div className="task-content">
                        <div className="task-top-row">
                          <div className="task-info">
                            <button 
                              className="task-check"
                              onClick={() => handleConcluir(t.id, t.tempo_estimado)}
                              title="Concluir tarefa"
                            >
                              <Check className="check-icon" size={14} strokeWidth={3} />
                            </button>
                            <span className="task-name">{t.nome}</span>
                          </div>
                          <div className="task-actions">
                            <button className="action-btn" onClick={() => handleEdit(t)} title="Editar Missão">
                              <Edit2 size={14} />
                            </button>
                            {/* AQUI ESTÁ O BOTÃO CHAMANDO O NOVO MODAL */}
                            <button className="action-btn delete-btn" onClick={() => handleDeleteRequest(t.id)} title="Excluir Missão">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="task-meta">
                          <Square size={10} /> {t.tempo_estimado} min &nbsp;&nbsp; {index === 0 ? "Missão Principal" : "Pendente"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="list-section">
              <div className="list-toggle" onClick={() => setMostrarConcluidas(!mostrarConcluidas)}>
                <span>Concluídas ({tarefasConcluidas.length})</span>
                {mostrarConcluidas ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {mostrarConcluidas && (
                <div className="task-list completed-list">
                  {tarefasConcluidas.length === 0 && (
                    <p className="empty-message">Nenhuma missão concluída ainda.</p>
                  )}
                  {tarefasConcluidas.map(t => (
                    <div key={t.id} className="task-card completed">
                      <div className="task-content" style={{ paddingLeft: '24px' }}>
                        <div className="task-top-row">
                          <div className="task-info">
                            <div className="task-check checked">
                              <Check size={14} strokeWidth={3} color="#FFFFFF" />
                            </div>
                            <span className="task-name">{t.nome}</span>
                          </div>
                        </div>
                        <div className="task-meta">
                          <Square size={10} /> {t.tempo_estimado} min &nbsp;&nbsp; Finalizada
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </aside>
        </div>
      </main>

      {/* --- MODAL GLOBAL (Substitui Alert e Confirm) --- */}
      {modal.aberto && (
        <div className="popup-overlay">
          <div className="popup-content generic-modal">
            <div className="modal-icon">
              <AlertCircle size={32} color={modal.tipo === 'confirmacao' ? '#DC2626' : '#C4A24A'} />
            </div>
            <h3 className="modal-title">{modal.tipo === 'confirmacao' ? 'Atenção' : 'Aviso'}</h3>
            <p className="modal-text">{modal.mensagem}</p>
            
            <div className="modal-actions">
              {modal.tipo === 'confirmacao' && (
                <button className="modal-btn cancel-btn" onClick={fecharModal}>
                  Cancelar
                </button>
              )}
              <button 
                className="modal-btn confirm-btn" 
                onClick={() => {
                  if (modal.acaoConfirmar) modal.acaoConfirmar();
                  else fecharModal();
                }}
              >
                {modal.tipo === 'confirmacao' ? 'Confirmar' : 'Entendi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}