const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const auth = require('../middleware/auth');

router.get('/', auth(), contactController.getAll);
router.post('/', auth(), contactController.create);
router.put('/:id', auth(), contactController.update);

module.exports = router;
