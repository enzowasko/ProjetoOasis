const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

router.post('/login', usuariosController.login);
router.put('/:id', usuariosController.atualizarPerfil);
router.get('/ranking', usuariosController.ranking);

module.exports = router;