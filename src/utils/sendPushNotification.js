import fetch from 'node-fetch';

/**
 * Envía una notificación push usando el servicio de Expo
 * @param {string} expoPushToken - Token de Expo Push del usuario
 * @param {string} title - Título de la notificación
 * @param {string} body - Cuerpo de la notificación
 * @param {object} data - Datos adicionales para la notificación
 */
export async function sendPushNotification(expoPushToken, title, body, data = {}) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
    priority: 'high',
    channelId: 'default',
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    
    if (result.data && result.data.status === 'error') {
      console.error('❌ Error al enviar notificación push:', result.data);
      return { success: false, error: result.data };
    }

    console.log('✅ Notificación push enviada:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error al enviar notificación push:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envía notificaciones push a múltiples usuarios
 * @param {Array} notifications - Array de objetos con { token, title, body, data }
 */
export async function sendBatchPushNotifications(notifications) {
  const messages = notifications.map(notif => ({
    to: notif.token,
    sound: 'default',
    title: notif.title,
    body: notif.body,
    data: notif.data || {},
    priority: 'high',
    channelId: 'default',
  }));

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log('✅ Notificaciones push por lote enviadas:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error al enviar notificaciones por lote:', error);
    return { success: false, error: error.message };
  }
}
