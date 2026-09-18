import { SlashCommandBuilder } from 'discord.js';
import { requirePlayer } from '../features/music.js';

export const data = new SlashCommandBuilder().setName('skip').setDescription('Passer la musique en cours');

export async function execute(interaction) {
  const player = await requirePlayer(interaction);
  if (!player) return;

  player.skip();
  await interaction.reply({ content: '⏭️ Musique passée.' });
}
