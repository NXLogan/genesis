import { SlashCommandBuilder } from 'discord.js';
import { requirePlayer } from '../features/music.js';

export const data = new SlashCommandBuilder()
  .setName('pause')
  .setDescription('Mettre en pause / reprendre la musique');

export async function execute(interaction) {
  const player = await requirePlayer(interaction);
  if (!player) return;

  player.pause(!player.paused);
  await interaction.reply({ content: player.paused ? '⏸️ Musique en pause.' : '▶️ Lecture reprise.' });
}
