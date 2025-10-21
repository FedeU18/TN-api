import express from 'express';
import * as soapWrapperController from '../controllers/soapWrapper.controller.js';

const router = express.Router();

router.get('/pedidos', soapWrapperController.getPedidosPorEmail);

export default router;