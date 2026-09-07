import { SlashCommandBuilder } from 'discord.js';
import { requirePlayer } from '../features/music.js';

export const data = new SlashCommandBuilder()
  .setName('volume')
  .setDescription('Régler le volume')
  .addIntegerOption((opt) =>
    opt.setName('niveau').setDescription('Volume (0-150)').setRequired(true).setMinValue(0).setMaxValue(150)
  );

export async function execute(interaction) {
  const player = await requirePlayer(interaction);
  if (!player) return;

  const volume = interaction.options.getInteger('niveau');
  player.setVolume(volume);
  await interaction.reply({ content: `🔊 Volume réglé à **${volume}%**.` });
}
