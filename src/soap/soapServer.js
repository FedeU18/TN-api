import http from 'http';
import { soap } from 'strong-soap';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { getPedidosPorEmail } from './pedidoService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const wsdl = fs.readFileSync(path.join(__dirname, 'pedidoService.wsdl'), 'utf8');

// Implementación del servicio SOAP
const service = {
	PedidoService: {
		PedidoPort: {
			getPedidosPorEmail: function(args, cb, headers, req) {
				// strong-soap puede parsear el body en distintas estructuras dependiendo del cliente
				let email = null;
				if (args) {
					email = args.email || (args.getPedidosPorEmailRequest && args.getPedidosPorEmailRequest.email) || (args.getPedidosPorEmail && args.getPedidosPorEmail.email);
				}
				if (!email) {
					cb(null, { pedidos: { pedido: [] } });
					return;
				}
				getPedidosPorEmail(email)
					.then((pedidos) => {
						const result = { pedidos: { pedido: pedidos } };
						cb(null, result);
					})
					.catch((err) => {
						console.error('Error en getPedidosPorEmail SOAP handler:', err);
						cb(null, { pedidos: { pedido: [] } });
					});
			},
		},
	},
};

const server = http.createServer();

// Oyente global para inyectar cabeceras CORS y responder preflight antes de que strong-soap procese la petición.
// Se usa prependListener para que corra antes de otros listeners que strong-soap agrega.
server.prependListener('request', function(request, response) {
	// Asegurar cabeceras CORS básicas
	if (!response.getHeader('Access-Control-Allow-Origin')) response.setHeader('Access-Control-Allow-Origin', '*');
	if (!response.getHeader('Access-Control-Allow-Methods')) response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
	if (!response.getHeader('Access-Control-Allow-Headers')) response.setHeader('Access-Control-Allow-Headers', 'Content-Type, SOAPAction');

	// Si la petición solicita el WSDL, respondemos a OPTIONS/GET aquí para asegurar CORS.
	const reqUrl = request.url || '';
	const reqPath = reqUrl.split('?')[0];

	if (reqPath === '/wsdl') {
		if (request.method === 'OPTIONS') {
			const corsHeaders = {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, SOAPAction',
			};
			response.writeHead(204, corsHeaders);
			return response.end();
		}

		if (request.method === 'GET') {
			const body = wsdl;
			const corsHeaders = {
				'Content-Type': 'application/xml',
				'Content-Length': Buffer.byteLength(body),
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, SOAPAction',
			};
			response.writeHead(200, corsHeaders);
			return response.end(body);
		}
	}
	// Para otros paths dejamos que strong-soap u otros listeners manejen la petición.
});

const PORT = 8001;
server.listen(PORT, function() {
	console.log('SOAP server escuchando en puerto ' + PORT);
	soap.listen(server, '/wsdl', service, wsdl);
	// strong-soap inicializado en /wsdl
});
