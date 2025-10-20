const soap = require('strong-soap').soap;

const WSDL_URL = 'http://localhost:8001/wsdl';

/**
 * Endpoint REST que actúa como wrapper del servicio SOAP getPedidosPorEmail
 * @param {*} req
 * @param {*} res
 */
exports.getPedidosPorEmail = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Falta el parámetro email' });
  try {
    soap.createClient(WSDL_URL, {}, function(err, client) {
      if (err) return res.status(500).json({ error: err.message });
      client.getPedidosPorEmail({ email }, function(err, result) {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};