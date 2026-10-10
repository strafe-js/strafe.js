import { Client } from '../packages/strafebot/src/index.js';

const client = new Client({
  apiBase: process.env.STRAFE_API!,
  gatewayUrl: process.env.STRAFE_GATEWAY!,
});

client.on('ready', (user) => {
  console.log(`online as ${user.username} (${user.id})`);
});

client.on('messageCreate', async (msg) => {
  if (!msg.plaintext) return;
  if (msg.sender_id === client.user?.id) return;
  if (msg.plaintext.trim() === '!ping') {
    await client.rest.createMessage(msg.room_id, {
      plaintext: `pong <@${msg.sender_id}>`,
      reply_to_id: msg.id,
    });
  }
});

await client.login(process.env.BOT_TOKEN!);
