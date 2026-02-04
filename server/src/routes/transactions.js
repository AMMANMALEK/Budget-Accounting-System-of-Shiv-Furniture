const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

router.get('/', auth(), transactionController.getAll);
router.post('/bill', auth(), transactionController.createBill);
router.post('/invoice', auth(), transactionController.createInvoice);
router.patch('/bill/:id', auth(), transactionController.updateBillStatus);

module.exports = router;
