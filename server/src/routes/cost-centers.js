const express = require('express');
const router = express.Router();
const costCenterController = require('../controllers/costCenterController');
const auth = require('../middleware/auth');

router.get('/', auth(), costCenterController.getAll);
router.post('/', auth('ADMIN'), costCenterController.create);
router.put('/:id', auth('ADMIN'), costCenterController.update);
router.delete('/:id', auth('ADMIN'), costCenterController.delete);

module.exports = router;
