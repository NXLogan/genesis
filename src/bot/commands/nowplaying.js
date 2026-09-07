import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { baseEmbed, COLORS } from '../utils.js';
import { formatDuration, requirePlayer } from '../features/music.js';

export const data = new SlashCommandBuilder()
  .setName('nowplaying')
  .setDescription('Voir la musique en cours');

export async function execute(interaction) {
  const player = await requirePlayer(interaction, { needSameVoice: false });
  if (!player) return;

  const track = player.queue.current;
  if (!track) {
    return interaction.reply({ content: '⚠️ Aucune musique en cours.', flags: MessageFlags.Ephemeral });
  }

  const position = player.position ?? player.shoukaku?.position ?? 0;
  const progress = track.isStream
    ? '🔴 Live'
    : `${formatDuration(position)} / ${formatDuration(track.length)}`;

  const embed = baseEmbed(COLORS.primary)
    .setTitle('🎶 En cours de lecture')
    .setDescription(`**[${track.title}](${track.uri})**`)
    .addFields(
      { name: 'Auteur', value: track.author || 'Inconnu', inline: true },
      { name: 'Progression', value: progress, inline: true },
      { name: 'Volume', value: `${player.volume}%`, inline: true },
      { name: 'Demandé par', value: `${track.requester}`, inline: true }
    );
  if (track.thumbnail) embed.setThumbnail(track.thumbnail);

  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
