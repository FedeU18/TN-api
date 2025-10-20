const prisma = require('../lib/prisma');

/**
 * Consulta los pedidos de un usuario por email
 * @param {string} email - Email del usuario
 * @returns {Promise<Array>} - Lista de pedidos
 */
async function getPedidosPorEmail(email) {
	// Busca el cliente por email
	const cliente = await prisma.cliente.findUnique({
		where: { email },
	});
	if (!cliente) return [];
	// Busca los pedidos del cliente
	const pedidos = await prisma.pedido.findMany({
		where: { clienteId: cliente.id },
	});
	return pedidos;
}

module.exports = { getPedidosPorEmail };
