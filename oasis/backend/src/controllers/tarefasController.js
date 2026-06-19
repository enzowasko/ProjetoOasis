const db = require('../config/db');

module.exports = {
  async listar(req, res) {
    const { usuario_id } = req.query;
    try {
      const [tarefas] = await db.query(
        'SELECT * FROM tarefas WHERE usuario_id = ? ORDER BY data_agendada ASC, ordem ASC, id DESC',
        [usuario_id]
      );
      res.json(tarefas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: 'Erro ao listar tarefas' });
    }
  },

  async criar(req, res) {
    const { usuario_id, nome, tempo_estimado, data_agendada } = req.body;
    try {
      const [result] = await db.query(
        'INSERT INTO tarefas (usuario_id, nome, tempo_estimado, data_agendada) VALUES (?, ?, ?, ?)',
        [usuario_id, nome, tempo_estimado, data_agendada]
      );
      res.status(201).json({ id: result.insertId, mensagem: 'Tarefa criada com sucesso!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: 'Erro ao criar tarefa' });
    }
  },

  async atualizar(req, res) {
    const { id } = req.params;
    const { nome, tempo_estimado, data_agendada } = req.body;
    try {
      await db.query(
        'UPDATE tarefas SET nome = ?, tempo_estimado = ?, data_agendada = ? WHERE id = ?',
        [nome, tempo_estimado, data_agendada, id]
      );
      res.json({ mensagem: 'Tarefa atualizada com sucesso!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: 'Erro ao atualizar tarefa' });
    }
  },

  async excluir(req, res) {
    const { id } = req.params;
    try {
      await db.query('DELETE FROM tarefas WHERE id = ?', [id]);
      res.json({ mensagem: 'Tarefa excluída com sucesso!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: 'Erro ao excluir tarefa' });
    }
  },

  async concluir(req, res) {
    const { id } = req.params;
    const { xp_ganho } = req.body;

    try {
      // 1. Marca a tarefa como concluída e salva o XP
      await db.query(
        'UPDATE tarefas SET concluida = 1, xp_ganho = ?, data_conclusao = CURRENT_DATE WHERE id = ?',
        [xp_ganho, id]
      );

      // 2. Busca o dono da tarefa
      const [tarefas] = await db.query('SELECT usuario_id FROM tarefas WHERE id = ?', [id]);
      if (tarefas.length === 0) return res.status(404).json({ erro: 'Tarefa não encontrada' });
      const usuarioId = tarefas[0].usuario_id;

      // 3. Atualiza o XP total do usuário
      await db.query('UPDATE usuarios SET xp_total = xp_total + ? WHERE id = ?', [xp_ganho, usuarioId]);

      // 4. Devolve o novo XP para atualizar a barrinha no Frontend
      const [usuarios] = await db.query('SELECT xp_total FROM usuarios WHERE id = ?', [usuarioId]);
      res.json({ mensagem: 'Tarefa concluída!', xp_atualizado: usuarios[0].xp_total });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: 'Erro ao concluir tarefa' });
    }
  }
};