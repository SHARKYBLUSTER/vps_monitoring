/**
 * Service de notifications Telegram pour les alertes
 * Projet : VPS Monitoring Dashboard
 */

const axios = require('axios');
const config = require('../config/config');

let lastSentAlerts = new Map(); // Stocke timestamp du dernier envoi par type d'alerte

/**
 * Vérifie si on peut envoyer une notification pour cette alerte (cooldown)
 * @param {string} alertKey - Clé d'alerte unique
 * @returns {boolean}
 */
function canSendAlert(alertKey) {
  if (!config.telegram.enabled) return false;

  const now = Date.now();
  const cooldownMs = config.telegram.cooldownMinutes * 60 * 1000;

  const lastSent = lastSentAlerts.get(alertKey) || 0;
  const canSend = (now - lastSent) >= cooldownMs;

  if (canSend) {
    lastSentAlerts.set(alertKey, now);
  }

  return canSend;
}

/**
 * Envoie une notification Telegram
 * @param {Object} alert - Objet alerte {type, metric, message, value, threshold}
 * @param {boolean} isResolution - Si vrai, c'est une notification de résolution
 * @returns {Promise<boolean>}
 */
async function sendTelegramAlert(alert, isResolution = false) {
  if (!config.telegram.enabled) {
    console.log('⚠️  Notifications Telegram désactivées');
    return false;
  }

  if (!config.telegram.botToken || !config.telegram.chatId) {
    console.error('❌ Token Telegram ou Chat ID non configuré');
    return false;
  }

  const alertKey = isResolution ? `${alert.metric}-resolved` : alert.metric;

  if (!canSendAlert(alertKey)) {
    console.log(`⏳ Notification Telegram pour ${alert.metric} déjà envoyée récemment`);
    return false;
  }

  const apiUrl = `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`;

  const serverName = process.env.HOSTNAME || process.env.VPS_NAME || 'VPS';
  const timestamp = new Date().toLocaleString('fr-FR');
  const vpsIp = process.env.VPS_IP || 'localhost';

  let messageText = '';
  let emoji = '';

  if (isResolution) {
    emoji = '✅';
    messageText = `${emoji} *${serverName} - Alerte résolue*\n\n` +
      `📅 *Date* : ${timestamp}\n` +
      `📊 *Métrique* : ${alert.metric.toUpperCase()}\n` +
      `✅ *Statut* : Revenu à la normale\n` +
      `📉 *Valeur actuelle* : ${alert.value.toFixed(1)}%\n\n` +
      `➡️  [Ouvrir Dashboard](http://${vpsIp}:3000)`;
  } else {
    emoji = alert.type === 'danger' ? '🚨' : '⚠️';
    messageText = `${emoji} *${serverName} - ALERTE ${alert.type.toUpperCase()}*\n\n` +
      `📅 *Date* : ${timestamp}\n` +
      `📊 *Métrique* : ${alert.metric.toUpperCase()}\n` +
      `📈 *Valeur* : ${alert.value.toFixed(1)}%\n` +
      `📌 *Seuil* : ${alert.threshold}%\n` +
      `⚠️  *Message* : ${alert.message}\n\n` +
      `➡️  [Ouvrir Dashboard](http://${vpsIp}:3000)`;
  }

  try {
    const response = await axios.post(apiUrl, {
      chat_id: config.telegram.chatId,
      text: messageText,
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
    }, {
      timeout: 5000,
    });

    if (response.data && response.data.ok) {
      console.log(`✅ Notification Telegram envoyée pour ${alert.metric}`);
      return true;
    } else {
      console.error('❌ Erreur réponse Telegram:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur envoi Telegram:', error.message);
    
    if (error.response) {
      console.error('Détails:', error.response.data);
    }
    
    return false;
  }
}

/**
 * Envoie une notification de test
 * @returns {Promise<Object>}
 */
async function sendTelegramTest() {
  if (!config.telegram.enabled) {
    return { success: false, message: 'Telegram désactivé dans la config' };
  }

  if (!config.telegram.botToken || !config.telegram.chatId) {
    return { success: false, message: 'Token ou Chat ID non configuré' };
  }

  try {
    await sendTelegramAlert({
      type: 'info',
      metric: 'test',
      message: '✅ Test de notification Telegram depuis VPS Monitoring',
      value: 0,
      threshold: 0,
    }, false);

    return { success: true, message: '✅ Notification de test envoyée !' };
  } catch (error) {
    return { success: false, message: `❌ Erreur: ${error.message}` };
  }
}

/**
 * Vérifie la configuration Telegram
 * @returns {Promise<Object>}
 */
async function testTelegramConfig() {
  if (!config.telegram.enabled) {
    return { success: false, message: 'Telegram non activé' };
  }

  if (!config.telegram.botToken || !config.telegram.chatId) {
    return { success: false, message: 'Token ou Chat ID manquant' };
  }

  try {
    const apiUrl = `https://api.telegram.org/bot${config.telegram.botToken}/getMe`;
    const response = await axios.get(apiUrl, { timeout: 5000 });

    if (response.data && response.data.ok) {
      return {
        success: true,
        message: `✅ Bot Telegram "${response.data.result.username}" configuré correctement`,
        botInfo: response.data.result,
      };
    } else {
      return { success: false, message: '❌ Réponse invalide de Telegram' };
    }
  } catch (error) {
    return { success: false, message: `❌ Erreur: ${error.message}` };
  }
}

/**
 * Réinitialise le cooldown pour une alerte (utile pour les tests)
 * @param {string} alertKey - Clé d'alerte
 */
function resetCooldown(alertKey) {
  lastSentAlerts.delete(alertKey);
}

/**
 * Réinitialise tous les cooldowns
 */
function resetAllCooldowns() {
  lastSentAlerts.clear();
}

module.exports = {
  sendTelegramAlert,
  sendTelegramTest,
  testTelegramConfig,
  resetCooldown,
  resetAllCooldowns,
};
