require('dotenv').config();
const express = require('express');
const cors = require('cors');

// CAMINHOS CORRIGIDOS:
// Como o server.js já está dentro de 'src', ele só precisa entrar na pasta 'routes'
const tarefasRoutes = require('./routes/tarefasRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/tarefas', tarefasRoutes);
app.use('/usuarios', usuariosRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🌴 Servidor do Oásis rodando na porta ${PORT}`);
});