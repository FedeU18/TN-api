const http = require('http');
const soap = require('strong-soap').soap;
const fs = require('fs');
const { getPedidosPorEmail } = require('./pedidoService');

const wsdl = fs.readFileSync(__dirname + '/pedidoService.wsdl', 'utf8');

// Implementación del servicio SOAP
const service = {
	PedidoService: {
		PedidoPort: {
			getPedidosPorEmail: async function(args, cb, headers, req) {
				const email = args.email;
				const pedidos = await getPedidosPorEmail(email);
				// El WSDL debe definir el tipo de respuesta (array de pedidos)
				return { pedidos };
			},
		},
	},
};

const server = http.createServer(function(request, response) {
	response.end('Servicio SOAP de pedidos');
});

const PORT = 8001;
server.listen(PORT, function() {
	console.log('SOAP server escuchando en puerto ' + PORT);
	soap.listen(server, '/wsdl', service, wsdl);
});
