import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, User, LayoutDashboard, Flame, Square, 
  ChevronLeft, ChevronRight, Check, Calendar as CalendarIcon, 
  ChevronDown, ChevronUp, Trash2, Edit2, Calendar, Send, AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import './Calendario.css';

export function Calendario() {
  const navigate = useNavigate();
  
  /* --- ESTADOS DE USUÁRIO --- */
  const [userName, setUserName] = useState('');
  const [userId, setUserId]     = useState(null);
  const [ofensivaAtual, setOfensivaAtual] = useState(0);

  /* --- ESTADOS DE DATAS --- */
  const [dataAtual, setDataAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState(new Date().getDate());
  const [todasTarefas, setTodasTarefas] = useState([]);
  
  /* --- ESTADOS CRUD --- */
  const [tarefaInput,  setTarefaInput]  = useState('');
  const [tempoInput,   setTempoInput]   = useState(''); 
  const [idEditando,   setIdEditando]   = useState(null);

  /* --- ESTADOS UI --- */
  const [mostrarPendentes, setMostrarPendentes]   = useState(true);
  const [mostrarConcluidas, setMostrarConcluidas] = useState(true);

  /* --- ESTADO DO MODAL CUSTOMIZADO (Substitui alerts e confirms) --- */
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

  /* --- CARREGAR SESSÃO --- */
  useEffect(() => {
    const saved = localStorage.getItem('@Oasis:user');
    if (!saved) { navigate('/login'); return; }
    const u = JSON.parse(saved);
    setUserName(u.nome);
    setUserId(u.id);
    setOfensivaAtual(u.ofensiva || 0);
  }, [navigate]);

  /* --- CARREGAR TAREFAS --- */
  const buscarTarefas = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/tarefas?usuario_id=${userId}`);
      setTodasTarefas(res.data);
    } catch (err) { 
      console.error("Erro ao carregar dados.", err); 
    }
  };

  useEffect(() => { buscarTarefas(); }, [userId]);

  /* --- CÁLCULOS DE DATA --- */
  const ano = dataAtual.getFullYear();
  const mes = dataAtual.getMonth() + 1;
  const mesNome = dataAtual.toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
  const diasNoMes = new Date(ano, mes, 0).getDate();
  const primeiroDiaSemana = new Date(ano, mes - 1, 1).getDay();

  /* --- FILTRAR TAREFAS SELECIONADAS --- */
  const tarefasDoDia = todasTarefas.filter(t => {
    if (!t.data_agendada) return false;
    const d = new Date(t.data_agendada);
    const dataUTC = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    return dataUTC.getFullYear() === ano && (dataUTC.getMonth() + 1) === mes && dataUTC.getDate() === diaSelecionado;
  });

  const pendentesDoDia = tarefasDoDia.filter(t => !t.concluida);
  const concluidasDoDia = tarefasDoDia.filter(t => t.concluida);

  const xpDoDiaSelecionado = tarefasDoDia.reduce((acc, curr) => acc + (curr.concluida ? (curr.xp_ganho || 0) : 0), 0);
  const metaAtingida = xpDoDiaSelecionado >= 1000;

  /* --- NAVEGAÇÃO MÊS --- */
  const voltarMes = () => {
    setDataAtual(prevData => new Date(prevData.getFullYear(), prevData.getMonth() - 1, 1));
    setDiaSelecionado(1);
    setIdEditando(null);
    setTarefaInput('');
    setTempoInput('');
  };
  
  const avancarMes = () => {
    setDataAtual(prevData => new Date(prevData.getFullYear(), prevData.getMonth() + 1, 1));
    setDiaSelecionado(1);
    setIdEditando(null);
    setTarefaInput('');
    setTempoInput('');
  };

  /* --- GERAR GRADE --- */
  const dias = [];
  for (let i = 0; i < 42; i++) {
    if (i < primeiroDiaSemana || i >= primeiroDiaSemana + diasNoMes) {
      dias.push(null); 
    } else {
      dias.push(i - primeiroDiaSemana + 1); 
    }
  }

  /* --- LÓGICA CRUD --- */
  const handleAdd = async (e) => {
    if (e && e.key !== 'Enter') return;
    if (!tarefaInput.trim()) return mostrarAlerta('Digite o nome da missão.');
    
    const tempoNumerico = Number(tempoInput);
    if (!tempoNumerico || tempoNumerico < 1) return mostrarAlerta('Por favor, informe uma duração válida (ex: 30).');
    
    const dataAgendadaFormatada = `${ano}-${String(mes).padStart(2, '0')}-${String(diaSelecionado).padStart(2, '0')}`;

    try {
      if (idEditando) {
        await api.put(`/tarefas/${idEditando}`, {
          nome: tarefaInput,
          tempo_estimado: tempoNumerico,
          data_agendada: dataAgendadaFormatada,
        });
        setIdEditando(null);
      } else {
        await api.post('/tarefas', {
          usuario_id: userId, 
          nome: tarefaInput,
          tempo_estimado: tempoNumerico, 
          data_agendada: dataAgendadaFormatada,
        });
      }
      
      setTarefaInput(''); 
      setTempoInput('');
      buscarTarefas();
      setMostrarPendentes(true);
    } catch (error) { 
      console.error(error); 
      mostrarAlerta('Erro ao salvar a missão.');
    }
  };

  const handleEdit = (tarefa) => {
    setTarefaInput(tarefa.nome);
    setTempoInput(tarefa.tempo_estimado || '');
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
      }
      buscarTarefas();
    } catch (e) {
      console.error(e);
      mostrarAlerta('Erro ao excluir a missão.');
    }
  };

  const handleConcluir = async (id, tempo) => {
    const xpGanho = tempo * 50;

    try {
      const { data } = await api.patch(`/tarefas/${id}/concluir`, { xp_ganho: xpGanho });
      
      const saved = localStorage.getItem('@Oasis:user');
      if (saved) {
        const u = JSON.parse(saved);
        u.xp = data.xp_atualizado;
        localStorage.setItem('@Oasis:user', JSON.stringify(u));
      }

      buscarTarefas();
    } catch (e) {
      console.error(e);
      mostrarAlerta('Erro ao concluir a missão.');
    }
  };

  /* --- RENDER --- */
  return (
    <div className="dashboard-root">
      
      <main className="main-area full-width">
        
        {/* --- TOPBAR --- */}
        <header className="topbar">
          <div className="greeting">
            <span className="greeting-sub">VISÃO MENSAL</span>
            <h1 className="greeting-title">Seu Histórico</h1>
          </div>
          <div className="top-actions">
            <div className="streak-pill">
              <Flame size={14} fill="#C4A24A" color="#C4A24A" />
              <span>Sua Ofensiva: <strong>{ofensivaAtual} Dias</strong></span>
            </div>
            
            <div className="top-nav-links">
              <button className="top-text-btn" onClick={() => navigate('/dashboard')}>
                <LayoutDashboard size={16} /> <span>Dashboard</span>
              </button>
              <button className="top-text-btn active" onClick={() => navigate('/calendario')}>
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

        {/* --- CONTENT --- */}
        <div className="content-split">
          
          {/* --- CALENDAR GRID --- */}
          <section className="calendar-main-view">
            <div className="calendar-large-box">
              
              <div className="cal-big-header">
                <div className="cal-title-wrapper">
                  <h2>{mesNome} <strong>{ano}</strong></h2>
                </div>
                <div className="cal-nav-buttons">
                  <button onClick={voltarMes} title="Mês anterior"><ChevronLeft size={20} /></button>
                  <button onClick={avancarMes} title="Próximo mês"><ChevronRight size={20} /></button>
                </div>
              </div>

              <div className="cal-big-grid-week">
                <span>DOM</span><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span>
              </div>

              <div className="cal-big-grid-days">
                {dias.map((dia, index) => {
                  if (!dia) return <div key={`empty-${index}`} className="cal-big-day empty" />;
                  
                  const tarefasDoDiaRender = todasTarefas.filter(t => {
                    if (!t.data_agendada) return false;
                    const d = new Date(t.data_agendada);
                    const dataUTC = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
                    return dataUTC.getFullYear() === ano && (dataUTC.getMonth() + 1) === mes && dataUTC.getDate() === dia;
                  });

                  const temConcluida = tarefasDoDiaRender.some(t => t.concluida);
                  const temPendente = tarefasDoDiaRender.some(t => !t.concluida);

                  return (
                    <div 
                      key={`dia-${dia}`} 
                      className={`cal-big-day ${dia === diaSelecionado ? 'selected' : ''} ${temConcluida ? 'has-success' : ''}`} 
                      onClick={() => {
                        setDiaSelecionado(dia);
                        setIdEditando(null);
                        setTarefaInput('');
                        setTempoInput('');
                      }}
                    >
                      <span className="cal-day-num">{dia}</span>
                      <div className="cal-day-dots">
                        {temPendente && <div className="dot pending" />}
                        {temConcluida && <div className="dot completed" />}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </section>

          {/* --- SIDE PANEL --- */}
          <aside className="calendar-side-panel">
            
            <div className="missions-header">
              <div className="missions-title-group">
                <CalendarIcon size={20} color="#2C4438" />
                <h3>RESUMO DO DIA</h3>
              </div>
              <span className="day-badge">{String(diaSelecionado).padStart(2, '0')}/{String(mes).padStart(2, '0')}</span>
            </div>

            <div className={`day-stats-card ${metaAtingida ? 'sucesso' : 'falha'}`}>
              <span className="stat-label">XP Conquistado</span>
              <div className="stat-value-row">
                <strong>{xpDoDiaSelecionado}</strong> <span>XP</span>
              </div>
              <div className="meta-badge-wrapper">
                {metaAtingida ? (
                  <span className="badge-sucesso"><Trophy size={12} /> Meta Atingida</span>
                ) : (
                  <span className="badge-falha">Meta não atingida</span>
                )}
              </div>
            </div>

            {/* --- CRUD FORM --- */}
            <div className="missions-crud">
              {idEditando && (
                <div className="edit-badge">
                  <span>Editando Missão</span>
                  <button onClick={() => { setIdEditando(null); setTarefaInput(''); setTempoInput(''); }}>Cancelar</button>
                </div>
              )}

              <div className="new-mission-wrapper interactive-el">
                <input 
                  type="text" 
                  className="new-mission-input-bare" 
                  placeholder={idEditando ? "Editando..." : "Nova missão para este dia..."} 
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
                <div className="filter-group full-width">
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
              </div>
            </div>

            {/* --- LISTS --- */}
            <div className="list-section">
              <div className="list-toggle" onClick={() => setMostrarPendentes(!mostrarPendentes)}>
                <span>Pendentes ({pendentesDoDia.length})</span>
                {mostrarPendentes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {mostrarPendentes && (
                <div className="task-list">
                  {pendentesDoDia.length === 0 && (
                    <p className="empty-message">Nenhuma missão pendente.</p>
                  )}
                  {pendentesDoDia.map(t => (
                    <div key={t.id} className="task-card active has-hover-actions">
                      <div className="task-content">
                        
                        <div className="task-top-row">
                          <div className="task-info">
                            <button 
                              className="task-check"
                              onClick={() => handleConcluir(t.id, t.tempo_estimado)}
                              title="Concluir missão"
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
                          <Square size={10} /> {t.tempo_estimado} min &nbsp;&nbsp; Pendente
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="list-section">
              <div className="list-toggle" onClick={() => setMostrarConcluidas(!mostrarConcluidas)}>
                <span>Concluídas ({concluidasDoDia.length})</span>
                {mostrarConcluidas ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {mostrarConcluidas && (
                <div className="task-list completed-list">
                  {concluidasDoDia.length === 0 && (
                    <p className="empty-message">Nenhuma missão concluída.</p>
                  )}
                  {concluidasDoDia.map(t => (
                    <div key={t.id} className="task-card completed has-hover-actions">
                      <div className="task-content">
                        
                        <div className="task-top-row">
                          <div className="task-info">
                            <div className="task-check checked">
                              <Check size={14} strokeWidth={3} color="#FFFFFF" />
                            </div>
                            <span className="task-name">{t.nome}</span>
                          </div>
                          
                          <div className="task-actions">
                            <button className="action-btn delete-btn" onClick={() => handleDeleteRequest(t.id)} title="Excluir Missão">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="task-meta">
                          <Square size={10} /> {t.tempo_estimado} min &nbsp;&nbsp; 
                          <strong className="text-amber">+{t.xp_ganho || (t.tempo_estimado * 50)} XP</strong>
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

      {/* --- MODAL GLOBAL CUSTOMIZADO --- */}
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