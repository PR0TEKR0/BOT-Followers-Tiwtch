// 📦 Importaciones
import express from 'express';
import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

// 🌐 Configura servidor Express
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('✅ Bot de Discord activo');
});

app.listen(PORT, () => {
  console.log(`🌍 Servidor Express corriendo en http://localhost:${PORT}`);
});

// 🔐 Variables de entorno
const discordToken = process.env.DISCORD_TOKEN;
const channelId = process.env.CHANNEL_ID;
const twitchClientId = process.env.TWITCH_CLIENT_ID;
const twitchAccessToken = process.env.TWITCH_ACCESS_TOKEN;
const broadcasterId = process.env.BROADCASTER_ID;

// 🤖 Configura el bot de Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Evento cuando el bot está listo
client.once('ready', async () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);

  try {
    const response = await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${broadcasterId}`, {
      headers: {
        'Client-ID': twitchClientId,
        'Authorization': `Bearer ${twitchAccessToken}`
      }
    });

    const data = await response.json();
    const seguidores = data.total ?? 0;

    const canal = await client.channels.fetch(channelId);
    await canal.setName(`🟪Seguidores: ${seguidores}`);

    console.log(`✅ Nombre del canal actualizado: Seguidores: ${seguidores}`);
  } catch (error) {
    console.error('❌ Error actualizando el canal:', error);
  }
});

// Manejo de errores para que no se caiga el bot
client.on('error', error => {
  console.error('❌ Error del cliente Discord:', error);
});

client.on('warn', info => {
  console.warn('⚠️ Advertencia Discord:', info);
});

client.on('shardDisconnect', (event, shardId) => {
  console.warn(`⚠️ Shard ${shardId} desconectado. Intentando reconectar...`);
});

client.on('shardReconnecting', shardId => {
  console.log(`🔄 Shard ${shardId} intentando reconectar...`);
});

// Opcional: escuchar desconexión completa y reconectar (no muy común)
client.on('disconnect', (event) => {
  console.warn(`⚠️ Bot desconectado, código: ${event.code}. Reconectando...`);
  client.login(discordToken).catch(console.error);
});

// Login del bot
client.login(discordToken);

// Evitar que el proceso se caiga por errores no manejados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Rechazo no manejado:', reason);
});

process.on('uncaughtException', error => {
  console.error('❌ Excepción no atrapada:', error);
});