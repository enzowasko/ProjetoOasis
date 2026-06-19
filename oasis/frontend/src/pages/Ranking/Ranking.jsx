import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, User, LayoutDashboard, Flame, Medal, Calendar, Target } from 'lucide-react';
import api from '../../services/api';
import './Ranking.css';

export function Ranking() {
  const navigate = useNavigate();

  /* --- STATES: DADOS DO USUÁRIO & RANKING --- */
  const [userName, setUserName]           = useState('');
  const [userId, setUserId]               = useState(null);
  const [ofensivaAtual, setOfensivaAtual] = useState(0);
  const [ranking, setRanking]             = useState([]);

  /* --- EFFECTS: CARREGAR SESSÃO --- */
  useEffect(() => {
    const saved = localStorage.getItem('@Oasis:user');
    if (!saved) { 
      navigate('/login'); 
      return; 
    }
    const u = JSON.parse(saved);
    setUserName(u.nome);
    setUserId(u.id);
    setOfensivaAtual(u.ofensiva || 0);
  }, [navigate]);

  /* --- EFFECTS: CARREGAR RANKING DA API --- */
  useEffect(() => {
    const buscarRanking = async () => {
      try {
        const { data } = await api.get('/usuarios/ranking');
        setRanking(data);
      } catch (e) {
        console.error("Erro ao buscar ranking:", e);
      }
    };
    buscarRanking();
  }, []);

  /* --- CÁLCULO DE POSIÇÃO --- */
  const minhaPosicao = ranking.findIndex(user => user.id === userId) + 1;

  /* --- RENDER --- */
  return (
    <div className="dashboard-root ranking-root">
      
      {/* --- MAIN AREA --- */}
      <main className="main-area full-width">
        
        {/* --- TOPBAR --- */}
        <header className="topbar">
          <div className="greeting">
            <span className="greeting-sub">OÁSIS RANKING</span>
            <h1 className="greeting-title">Desempenho Global</h1>
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
              <button className="top-text-btn active" onClick={() => navigate('/ranking')}>
                <Trophy size={16} /> <span>Ranking</span>
              </button>
            </div>

            <button className="icon-btn profile-btn" title="Perfil" onClick={() => navigate('/perfil')}>
              <User size={18} />
            </button>
          </div>
        </header>

        {/* --- CONTEÚDO DO RANKING --- */}
        <div className="ranking-content-wrapper">
          <div className="ranking-container">
            
            {/* --- DESTAQUE: FREQUÊNCIA DO USUÁRIO --- */}
            <div className="user-highlight-card">
              <div className="highlight-info">
                <h2>Sua Frequência</h2>
                <p>Continue voltando todos os dias para subir no ranking e manter seu Oásis em evolução!</p>
              </div>
              
              <div className="highlight-stats">
                <div className="h-stat-box">
                  <Flame size={28} color="#D97706" fill="#F59E0B" />
                  <div className="h-stat-texts">
                    <span className="h-stat-value">{ofensivaAtual} dias</span>
                    <span className="h-stat-label">Ofensiva Atual</span>
                  </div>
                </div>
                
                <div className="h-stat-separator"></div>
                
                <div className="h-stat-box">
                  <Target size={28} color="#059669" />
                  <div className="h-stat-texts">
                    <span className="h-stat-value">{minhaPosicao > 0 ? `#${minhaPosicao}` : '--'}</span>
                    <span className="h-stat-label">Sua Posição</span>
                  </div>
                </div>
              </div>
            </div>

            {/* --- MURAL: LISTA GERAL --- */}
            <div className="ranking-board">
              <div className="ranking-header-section">
                <div className="ranking-title-group">
                  <div className="ranking-icon-wrapper">
                    <Trophy size={28} color="#C4A24A" />
                  </div>
                  <div>
                    <h2>Mural de Constância</h2>
                    <p>Os exploradores mais dedicados da plataforma.</p>
                  </div>
                </div>
              </div>

              <div className="ranking-list">
                {ranking.map((user, index) => {
                  const posicao = index + 1;
                  const isCurrentUser = user.id === userId;
                  
                  const MedalhaIcon = posicao === 1 ? Trophy : (posicao <= 3 ? Medal : null);
                  const corMedalha = posicao === 1 ? "#C4A24A" : (posicao === 2 ? "#9CA3AF" : "#B45309");
                  const corFundoMedalha = posicao === 1 ? "#FBF5E6" : (posicao === 2 ? "#F3F4F6" : "#FEF3C7");

                  return (
                    <div 
                      key={user.id} 
                      className={`ranking-item ${isCurrentUser ? 'current-user-item' : ''}`}
                    >
                      <div className="rank-posicao-nome">
                        <span className="posicao-numero">#{posicao}</span>
                        
                        {MedalhaIcon ? (
                          <div className="medalha-container" style={{ backgroundColor: corFundoMedalha }}>
                            <MedalhaIcon size={18} color={corMedalha} />
                          </div>
                        ) : (
                          <div className="medalha-container-empty" />
                        )}
                        
                        <span className="user-nome">{user.nome}</span>
                        {isCurrentUser && <span className="badge-voce">Você</span>}
                      </div>

                      <div className="rank-streak-area">
                        <Flame fill="#C4A24A" color="#C4A24A" size={18} />
                        <strong>{user.ofensiva} dias</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}