import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { baseEmbed, COLORS } from '../utils.js';
import { formatDuration, musicAvailable } from '../features/music.js';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Jouer une musique (YouTube, lien ou recherche)')
  .addStringOption((opt) =>
    opt.setName('musique').setDescription('Lien ou termes de recherche').setRequired(true)
  );

export async function execute(interaction) {
  if (!musicAvailable(interaction.client)) {
    return interaction.reply({
      content: '⚠️ Le serveur de musique (Lavalink) est hors ligne. Lance-le avec `npm run lavalink`.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) {
    return interaction.reply({
      content: '⚠️ Rejoins un salon vocal pour lancer de la musique.',
      flags: MessageFlags.Ephemeral,
    });
  }

  await interaction.deferReply();

  const query = interaction.options.getString('musique');
  const result = await interaction.client.music.search(query, { requester: interaction.user });

  if (!result.tracks.length) {
    return interaction.editReply({ content: `❌ Aucun résultat pour : \`${query}\`` });
  }

  const player = await interaction.client.music.createPlayer({
    guildId: interaction.guild.id,
    textId: interaction.channel.id,
    voiceId: voiceChannel.id,
    volume: 80,
    deaf: true,
  });

  if (result.type === 'PLAYLIST') {
    for (const track of result.tracks) player.queue.add(track);
    await interaction.editReply({
      embeds: [
        baseEmbed(COLORS.success).setDescription(
          `📃 Playlist **${result.playlistName}** ajoutée (**${result.tracks.length}** titres).`
        ),
      ],
    });
  } else {
    const track = result.tracks[0];
    player.queue.add(track);
    await interaction.editReply({
      embeds: [
        baseEmbed(COLORS.success).setDescription(
          `➕ **[${track.title}](${track.uri})** ajouté à la file` +
            (track.isStream ? ' (🔴 live)' : ` — ${formatDuration(track.length)}`)
        ),
      ],
    });
  }

  if (!player.playing && !player.paused) player.play();
}
