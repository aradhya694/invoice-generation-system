const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const invoiceController = require('../controllers/invoiceController');

router.get('/', auth, invoiceController.getAll);
router.get('/:id', auth, invoiceController.getById);
router.post('/', auth, invoiceController.create);
router.put('/:id', auth, invoiceController.update);

module.exports = router;
