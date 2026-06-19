import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, User, LayoutDashboard, Flame, Settings, Shield, Check, Mail, Calendar, Star, AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import './Perfil.css';

/* --- UTILS: CÁLCULO DE NÍVEL RPG --- */
const calcularNivelInfo = (xpTotal) => {
  let level = 1;
  let xpRestante = xpTotal;
  let xpDoNivelAtual = 1000; 

  while (xpRestante >= xpDoNivelAtual) {
    xpRestante -= xpDoNivelAtual;
    level++;
    xpDoNivelAtual = level * 1000; 
  }

  return { nivel: level, xpNoNivel: xpRestante, xpParaProximo: xpDoNivelAtual };
};

export function Perfil() {
  const navigate = useNavigate();

  /* --- STATES: DADOS DO USUÁRIO --- */
  const [userName, setUserName]           = useState("");
  const [userEmail, setUserEmail]         = useState("");
  const [xp, setXp]                       = useState(0);
  const [userId, setUserId]               = useState(null);
  const [ofensivaAtual, setOfensivaAtual] = useState(0);

  /* --- ESTADO DO MODAL CUSTOMIZADO --- */
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

  /* --- EFFECTS: INICIALIZAÇÃO --- */
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('@Oasis:user');
    if (!usuarioSalvo) {
      navigate('/login');
      return;
    }
    
    const u = JSON.parse(usuarioSalvo);
    setUserName(u.nome);
    setUserEmail(u.email || "e-mail não encontrado");
    setXp(u.xp || 0);
    setUserId(u.id);
    setOfensivaAtual(u.ofensiva || 0); 
  }, [navigate]);

  /* --- HANDLERS: ATUALIZAR PERFIL --- */
  const handleSalvar = async () => {
    try {
      await api.put(`/usuarios/${userId}`, { nome: userName });

      const usuarioSalvo = JSON.parse(localStorage.getItem('@Oasis:user'));
      usuarioSalvo.nome = userName;
      localStorage.setItem('@Oasis:user', JSON.stringify(usuarioSalvo));

      mostrarAlerta("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      mostrarAlerta("Erro ao tentar salvar as alterações.");
    }
  };

  /* --- VARIÁVEIS DE RENDERIZAÇÃO --- */
  const { nivel, xpNoNivel, xpParaProximo } = calcularNivelInfo(xp);
  const progressoBarraXp = (xpNoNivel / xpParaProximo) * 100;

  /* --- RENDER --- */
  return (
    <div className="dashboard-root profile-root">
      
      <main className="main-area full-width">
        
        {/* --- TOPBAR --- */}
        <header className="topbar">
          <div className="greeting">
            <span className="greeting-sub">CONFIGURAÇÕES</span>
            <h1 className="greeting-title">Meu Perfil</h1>
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
              <button className="top-text-btn" onClick={() => navigate('/calendario')}>
                <Calendar size={16} /> <span>Calendário</span>
              </button>
              <button className="top-text-btn" onClick={() => navigate('/ranking')}>
                <Trophy size={16} /> <span>Ranking</span>
              </button>
            </div>

            <button className="icon-btn profile-btn active" title="Perfil" onClick={() => navigate('/perfil')}>
              <User size={18} />
            </button>
          </div>
        </header>

        {/* --- CONTEÚDO CENTRAL --- */}
        <div className="profile-content-wrapper">
          <div className="profile-card-large">
            
            {/* --- COLUNA ESQUERDA: CRACHÁ --- */}
            <aside className="profile-visual-sidebar">
              <div className="profile-avatar-giant">
                <User size={56} color="#2C4438" />
              </div>
              <h2>{userName}</h2>
              <p className="profile-title">Explorador Nível {nivel}</p>
              
              <div className="profile-xp-section">
                <div className="pxp-header">
                  <span>Progresso do Nível</span>
                  <span className="pxp-values">
                    <strong style={{ color: '#D97706' }}>{xpNoNivel.toLocaleString('pt-BR')}</strong> / {xpParaProximo.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="pxp-bar-bg">
                  <div className="pxp-bar-fill" style={{ width: `${Math.min(progressoBarraXp, 100)}%` }}></div>
                </div>
                <div className="pxp-levels">
                  <span>Nv. {nivel}</span>
                  <span>Nv. {nivel + 1}</span>
                </div>
              </div>

              <div className="profile-stats-grid">
                <div className="p-stat-box">
                  <Flame size={20} color="#D97706" />
                  <div>
                    <strong>{ofensivaAtual} dias</strong>
                    <span>Ofensiva</span>
                  </div>
                </div>
                <div className="p-stat-box">
                  <Star size={20} color="#059669" />
                  <div>
                    <strong>{xp.toLocaleString('pt-BR')}</strong>
                    <span>XP Total</span>
                  </div>
                </div>
              </div>

            </aside>

            {/* --- COLUNA DIREITA: FORMULÁRIOS --- */}
            <div className="profile-forms-area">
              
              <section className="form-section">
                <div className="form-section-header">
                  <Settings size={20} color="#2C4438" />
                  <h3>Configurações Gerais</h3>
                </div>
                
                <div className="input-group">
                  <label>Nome de Exibição</label>
                  <input 
                    type="text" 
                    className="profile-input"
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)} 
                    placeholder="Como quer ser chamado?"
                  />
                </div>

                <div className="input-group">
                  <label>Meta de XP Diária</label>
                  <select className="profile-select" defaultValue="1000">
                    <option value="500">500 XP (Leve)</option>
                    <option value="1000">1000 XP (Padrão)</option>
                    <option value="2000">2000 XP (Hardcore)</option>
                  </select>
                </div>
              </section>

              <section className="form-section">
                <div className="form-section-header">
                  <Shield size={20} color="#2C4438" />
                  <h3>Segurança e Conta</h3>
                </div>

                <div className="input-group">
                  <label>E-mail Vinculado</label>
                  <div className="input-with-icon">
                    <Mail size={16} className="input-icon" />
                    <input 
                      type="email" 
                      className="profile-input disabled"
                      value={userEmail} 
                      disabled 
                    />
                  </div>
                  <span className="input-hint">O e-mail não pode ser alterado por aqui.</span>
                </div>
              </section>

              <div className="profile-actions">
                <button className="profile-save-btn" onClick={handleSalvar}>
                  <Check size={18} />
                  Salvar Alterações
                </button>
              </div>

            </div>
          </div>
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