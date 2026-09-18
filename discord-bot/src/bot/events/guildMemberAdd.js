import { Events } from 'discord.js';
import { getConfig } from '../../db/index.js';
import { baseEmbed, COLORS, sendLog } from '../utils.js';
import { handleJoinSecurity } from '../features/security.js';

export const name = Events.GuildMemberAdd;

export async function execute(client, member) {
  if (member.guild.id !== process.env.GUILD_ID) return;

  // Anti-raid
  await handleJoinSecurity(client, member);

  // Log d'arrivée
  await sendLog(
    client,
    baseEmbed(COLORS.success)
      .setTitle('📥 Nouveau membre')
      .setDescription(`${member} (\`${member.user.tag}\`) a rejoint le serveur.`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields({
        name: 'Compte créé',
        value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
      })
  );

  // Message de bienvenue en MP
  if (!getConfig('welcome_enabled')) return;

  const message = getConfig('welcome_message')
    .replaceAll('{user}', member.user.username)
    .replaceAll('{server}', member.guild.name);

  await member
    .send({
      embeds: [
        baseEmbed(COLORS.primary)
          .setTitle(`🎮 Bienvenue sur ${member.guild.name} !`)
          .setDescription(message)
          .setThumbnail(member.guild.iconURL() ?? null),
      ],
    })
    .catch(() => null); // MP fermés : on ignore
}
