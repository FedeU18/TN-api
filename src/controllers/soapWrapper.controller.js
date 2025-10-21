// Usar fetch global si está disponible (Node 18+). Si no, intentar importar node-fetch en tiempo de ejecución.
let runtimeFetch = globalThis.fetch;
async function getFetch() {
  if (runtimeFetch) return runtimeFetch;
  try {
    const mod = await import('node-fetch');
    runtimeFetch = mod.default || mod;
    return runtimeFetch;
  } catch (err) {
    // No hay fallback disponible; la llamada fallará cuando intentemos usar fetch
    throw err;
  }
}

/**
 * Endpoint REST que actúa como wrapper del servicio SOAP getPedidosPorEmail
 * Implementado via POST directo al endpoint WSDL (proxy) y parseo de XML de respuesta.
 */
export const getPedidosPorEmail = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Falta el parámetro email' });

  try {
    const wsdlEndpoint = 'http://localhost:3000/wsdl'; // proxy endpoint

    const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>\n` +
      `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://tn-api/soap">\n` +
      `  <soapenv:Header/>\n` +
      `  <soapenv:Body>\n` +
      `    <tns:getPedidosPorEmailRequest>\n` +
      `      <email>${email}</email>\n` +
      `    </tns:getPedidosPorEmailRequest>\n` +
      `  </soapenv:Body>\n` +
      `</soapenv:Envelope>`;

    const fetchImpl = await getFetch();
    const fetchRes = await fetchImpl(wsdlEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml; charset=utf-8' },
      body: xmlRequest,
    });

    const text = await fetchRes.text();
  // Intentar extraer bloques <pedido> de la respuesta SOAP
    const pedidoBlocks = Array.from((text.match(/<pedido[\s\S]*?<\/pedido>/gi) || []));
    const pedidos = pedidoBlocks.map(block => {
      const idMatch = block.match(/<id>([\s\S]*?)<\/id>/i);
      const estadoMatch = block.match(/<estado>([\s\S]*?)<\/estado>/i);
      const fechaMatch = block.match(/<fecha>([\s\S]*?)<\/fecha>/i);
      const origenMatch = block.match(/<direccion_origen>([\s\S]*?)<\/direccion_origen>/i);
      const destinoMatch = block.match(/<direccion_destino>([\s\S]*?)<\/direccion_destino>/i);
      return {
        id: idMatch ? idMatch[1].trim() : null,
        estado: estadoMatch ? estadoMatch[1].trim() : null,
        fecha: fechaMatch ? fechaMatch[1].trim() : null,
        direccion_origen: origenMatch ? origenMatch[1].trim() : null,
        direccion_destino: destinoMatch ? destinoMatch[1].trim() : null,
      };
    });

    return res.json({ pedidos });
  } catch (err) {
    // Registrar el error y devolver respuesta genérica al cliente
    console.error('Error en wrapper HTTP -> SOAP:', err);
    return res.status(500).json({ error: 'Error al consultar el servicio SOAP' });
  }
};