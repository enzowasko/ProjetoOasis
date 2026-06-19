import { useNavigate } from 'react-router-dom';
import logoOasis from '../../assets/logo-oasis.png';
import './Landing.css';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-content">
        <img src={logoOasis} alt="Logo Oásis" className="landing-logo" />
        <h1>BEM-VINDO AO OÁSIS</h1>
        <p>Onde a sua produtividade encontra tranquilidade!</p>
        <button className="btn-comecar" onClick={() => navigate('/login')}>
          VAMOS COMEÇAR
        </button>
      </div>
    </div>
  );
}