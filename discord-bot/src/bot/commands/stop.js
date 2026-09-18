import { SlashCommandBuilder } from 'discord.js';
import { requirePlayer } from '../features/music.js';

export const data = new SlashCommandBuilder()
  .setName('stop')
  .setDescription('Arrêter la musique et vider la file');

export async function execute(interaction) {
  const player = await requirePlayer(interaction);
  if (!player) return;

  player.destroy();
  await interaction.reply({ content: '⏹️ Musique arrêtée, file vidée. À la prochaine !' });
}
