import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoOasis from '../../assets/logo-oasis.png';
import './Login.css';
import api from '../../services/api'; 

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/usuarios/login', { email, senha });
      localStorage.setItem('@Oasis:user', JSON.stringify(response.data));
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.erro || "Erro ao tentar fazer login.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <img src={logoOasis} alt="Logo" className="login-logo" />
        <h2>Acessar o Oásis</h2>
        
        <div className="input-group">
          <label>E-mail</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        
        <div className="input-group">
          <label>Senha</label>
          <input type="password" required value={senha} onChange={e => setSenha(e.target.value)} />
        </div>
        
        <button type="submit" className="btn-entrar">ENTRAR</button>
      </form>
    </div>
  );
}