const express = require('express');
const router = express.Router();
const characterController = require('../controllers/characterController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas as rotas de personagem precisam de autenticação
router.use(authMiddleware);

router.post('/', characterController.createCharacter);
router.get('/', characterController.getCharacters);
router.get('/:id', characterController.getCharacterById);
router.put('/:id', characterController.updateCharacter);
router.put('/:id/score', characterController.updateCharacterScore);
router.delete('/:id', characterController.deleteCharacter);

module.exports = router;
