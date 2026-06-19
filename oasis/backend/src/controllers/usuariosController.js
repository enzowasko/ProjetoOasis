const db = require('../config/db');

module.exports = {
  async login(req, res) {
    const { email, senha } = req.body;
    try {
      const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [email, senha]);
      
      if (usuarios.length === 0) {
        return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
      }

      const user = usuarios[0];
      res.json({
        id: user.id,
        nome: user.nome,
        email: user.email,
        xp: user.xp_total,
        nivel: user.nivel,
        ofensiva: user.ofensiva
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: 'Erro ao fazer login' });
    }
  },

  async atualizarPerfil(req, res) {
    const { id } = req.params;
    const { nome } = req.body;
    try {
      await db.query('UPDATE usuarios SET nome = ? WHERE id = ?', [nome, id]);
      res.json({ mensagem: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: 'Erro ao atualizar perfil' });
    }
  },

  async ranking(req, res) {
    try {
      const [usuarios] = await db.query(
        'SELECT id, nome, ofensiva FROM usuarios ORDER BY ofensiva DESC LIMIT 10'
      );
      res.json(usuarios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: 'Erro ao buscar ranking' });
    }
  }
};