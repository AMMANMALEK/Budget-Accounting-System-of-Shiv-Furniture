const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const auth = require('../middleware/auth');

router.get('/', auth(), budgetController.getAll);
router.post('/', auth('ADMIN'), budgetController.setBudget);
router.get('/summary', auth(), budgetController.getSummary);

module.exports = router;
