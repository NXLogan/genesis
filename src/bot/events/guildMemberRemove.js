import { Events } from 'discord.js';
import { baseEmbed, COLORS, sendLog } from '../utils.js';

export const name = Events.GuildMemberRemove;

export async function execute(client, member) {
  if (member.guild.id !== process.env.GUILD_ID) return;

  await sendLog(
    client,
    baseEmbed(COLORS.warning)
      .setTitle('📤 Départ')
      .setDescription(`\`${member.user.tag}\` a quitté le serveur.`)
      .setThumbnail(member.user.displayAvatarURL())
  );
}
