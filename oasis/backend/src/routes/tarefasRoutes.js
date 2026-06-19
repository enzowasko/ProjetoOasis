const express = require('express');
const router = express.Router();
const tarefasController = require('../controllers/tarefasController');

router.get('/', tarefasController.listar);
router.post('/', tarefasController.criar);
router.put('/:id', tarefasController.atualizar);
router.delete('/:id', tarefasController.excluir);
router.patch('/:id/concluir', tarefasController.concluir);

module.exports = router;