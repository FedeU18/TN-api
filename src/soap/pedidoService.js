import prisma from '../lib/prisma.js';

/**
 * Consulta los pedidos de un usuario por email
 * @param {string} email - Email del usuario
 * @returns {Promise<Array>} - Lista de pedidos
 */

async function getPedidosPorEmail(email) {
	try {
		// En el schema Prisma el modelo de usuarios se llama `Usuario`
		const cliente = await prisma.usuario.findUnique({
			where: { email },
		});
		if (!cliente) return [];

		// En el modelo Pedido la FK al cliente es `id_cliente` y la PK de Usuario es `id_usuario`
		const pedidos = await prisma.pedido.findMany({
			where: { id_cliente: cliente.id_usuario },
		});

		// Normalizar la salida para exponer solo los campos que espera el WSDL
		return pedidos.map(p => ({
			id: p.id_pedido,
			estado: p.estado?.nombre_estado || p.id_estado?.toString?.() || null,
			fecha: p.fecha_creacion ? p.fecha_creacion.toISOString() : null,
			direccion_origen: p.direccion_origen || null,
			direccion_destino: p.direccion_destino || null,
		}));
	} catch (err) {
		console.error('Error en getPedidosPorEmail:', err);
		return [];
	}
}

export { getPedidosPorEmail };
