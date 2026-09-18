import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { Kazagumo } from 'kazagumo';
import { Connectors } from 'shoukaku';
import { baseEmbed, COLORS } from '../utils.js';

/** Initialise Kazagumo (Lavalink). Le bot fonctionne même si Lavalink est éteint. */
export function initMusic(client) {
  const nodes = [
    {
      name: 'principal',
      url: `${process.env.LAVALINK_HOST || 'localhost'}:${process.env.LAVALINK_PORT || 2333}`,
      auth: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
      secure: false,
    },
  ];

  const kazagumo = new Kazagumo(
    {
      defaultSearchEngine: 'youtube',
      send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
      },
    },
    new Connectors.DiscordJS(client),
    nodes,
    { moved: ({ state }) => state, reconnectTries: Infinity, restTimeout: 10000 }
  );

  client.music = kazagumo;

  kazagumo.shoukaku.on('ready', (name) => console.log(`🎵 Lavalink « ${name} » connecté`));
  kazagumo.shoukaku.on('error', () => {
    /* silencieux : Lavalink peut être éteint, la musique est simplement indisponible */
  });
  kazagumo.shoukaku.on('close', () => {});
  kazagumo.shoukaku.on('disconnect', () => {});

  kazagumo.on('playerStart', async (player, track) => {
    const channel = client.channels.cache.get(player.textId);
    if (!channel) return;

    const embed = baseEmbed(COLORS.primary)
      .setTitle('🎶 Lecture en cours')
      .setDescription(`**[${track.title}](${track.uri})**`)
      .addFields(
        { name: 'Auteur', value: track.author || 'Inconnu', inline: true },
        {
          name: 'Durée',
          value: track.isStream ? '🔴 Live' : formatDuration(track.length),
          inline: true,
        },
        { name: 'Demandé par', value: `${track.requester}`, inline: true }
      );
    if (track.thumbnail) embed.setThumbnail(track.thumbnail);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('music:pause').setEmoji('⏯️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('music:skip').setEmoji('⏭️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('music:stop').setEmoji('⏹️').setStyle(ButtonStyle.Danger)
    );

    const message = await channel.send({ embeds: [embed], components: [row] }).catch(() => null);
    if (message) player.data.set('nowPlayingMessage', message);
  });

  kazagumo.on('playerEnd', (player) => {
    const message = player.data.get('nowPlayingMessage');
    if (message) message.delete().catch(() => null);
  });

  kazagumo.on('playerEmpty', async (player) => {
    const channel = client.channels.cache.get(player.textId);
    if (channel) {
      await channel
        .send({
          embeds: [baseEmbed(COLORS.info).setDescription("📭 File d'attente terminée, je quitte le salon vocal.")],
        })
        .catch(() => null);
    }
    player.destroy();
  });

  return kazagumo;
}

/** Vérifie que Lavalink est joignable. */
export function musicAvailable(client) {
  const node = [...client.music.shoukaku.nodes.values()][0];
  return node && node.state === 2; // 2 = CONNECTED
}

/**
 * Garde-fous communs aux commandes musique.
 * @returns {import('kazagumo').KazagumoPlayer|null} le player, ou null (réponse déjà envoyée)
 */
export async function requirePlayer(interaction, { needSameVoice = true } = {}) {
  if (!musicAvailable(interaction.client)) {
    await interaction.reply({
      content: '⚠️ Le serveur de musique (Lavalink) est hors ligne. Lance-le avec `npm run lavalink`.',
      flags: MessageFlags.Ephemeral,
    });
    return null;
  }

  const player = interaction.client.music.players.get(interaction.guild.id);
  if (!player) {
    await interaction.reply({ content: '⚠️ Aucune musique en cours.', flags: MessageFlags.Ephemeral });
    return null;
  }

  if (needSameVoice) {
    const voiceId = interaction.member.voice.channelId;
    if (!voiceId || voiceId !== player.voiceId) {
      await interaction.reply({
        content: '⚠️ Tu dois être dans le même salon vocal que le bot.',
        flags: MessageFlags.Ephemeral,
      });
      return null;
    }
  }

  return player;
}

export function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

/** Gère les boutons de contrôle musique (music:pause / music:skip / music:stop). */
export async function handleMusicButton(interaction, action) {
  const player = await requirePlayer(interaction);
  if (!player) return;

  switch (action) {
    case 'pause': {
      player.pause(!player.paused);
      await interaction.reply({
        content: player.paused ? '⏸️ Musique en pause.' : '▶️ Lecture reprise.',
        flags: MessageFlags.Ephemeral,
      });
      break;
    }
    case 'skip': {
      player.skip();
      await interaction.reply({ content: '⏭️ Musique passée.', flags: MessageFlags.Ephemeral });
      break;
    }
    case 'stop': {
      player.destroy();
      await interaction.reply({ content: '⏹️ Musique arrêtée, file vidée.', flags: MessageFlags.Ephemeral });
      break;
    }
  }
}
