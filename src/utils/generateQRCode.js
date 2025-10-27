import axios from "axios";

/**
 * Genera un código QR en base64 usando la API de QRCode Monkey.
 * @param {number} pedidoId - ID del pedido.
 * @param {string} token - Token único del pedido (para validar QR).
 * @returns {Promise<string|null>} - Imagen QR en base64 o null si falla.
 */
export async function generateQRCode(pedidoId, token) {
  const qrApiUrl = "https://api.qrcode-monkey.com/qr/custom";

  const qrData = {
    data: `http://localhost:3000/api/pedidos/verificar-qr/${pedidoId}?token=${token}`,
    config: {
      body: "square",
      eye: "frame0",
      eyeBall: "ball0",
      erColor: "#000000",
      bodyColor: "#000000",
    },
    size: 300,
    download: false,
    file: "png",
  };

  try {
    const response = await axios.post(qrApiUrl, qrData, {
      headers: { "Content-Type": "application/json" },
      responseType: "arraybuffer", // 👈 importante para recibir la imagen binaria
    });

    // Convertimos el buffer a base64
    const base64QR = Buffer.from(response.data, "binary").toString("base64");
    const qrBase64Url = `data:image/png;base64,${base64QR}`;

    return qrBase64Url;
  } catch (error) {
    console.error(
      "❌ Error al generar QR:",
      error.response?.data || error.message
    );
    return null;
  }
}
