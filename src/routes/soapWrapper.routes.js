const express = require('express');
const router = express.Router();
const soapWrapperController = require('../controllers/soapWrapper.controller');

router.get('/pedidos', soapWrapperController.getPedidosPorEmail);

module.exports = router;