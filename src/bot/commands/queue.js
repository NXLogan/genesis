import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { baseEmbed, COLORS, truncate } from '../utils.js';
import { formatDuration, requirePlayer } from '../features/music.js';

export const data = new SlashCommandBuilder().setName('queue').setDescription("Voir la file d'attente");

export async function execute(interaction) {
  const player = await requirePlayer(interaction, { needSameVoice: false });
  if (!player) return;

  const current = player.queue.current;
  const upcoming = [...player.queue];

  const embed = baseEmbed(COLORS.primary).setTitle("🎶 File d'attente");

  if (current) {
    embed.addFields({
      name: '▶️ En cours',
      value: `**[${current.title}](${current.uri})** — ${
        current.isStream ? '🔴 Live' : formatDuration(current.length)
      } · demandé par ${current.requester}`,
    });
  }

  if (upcoming.length) {
    const list = upcoming
      .slice(0, 10)
      .map(
        (t, i) =>
          `**${i + 1}.** [${t.title}](${t.uri}) — ${t.isStream ? '🔴 Live' : formatDuration(t.length)}`
      )
      .join('\n');
    embed.addFields({
      name: `⏭️ À suivre (${upcoming.length})`,
      value: truncate(list + (upcoming.length > 10 ? `\n… et ${upcoming.length - 10} de plus` : ''), 1024),
    });
  } else if (!current) {
    embed.setDescription('📭 La file est vide.');
  }

  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
