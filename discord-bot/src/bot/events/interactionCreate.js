import { Events, MessageFlags } from 'discord.js';
import { handleRulesAccept } from '../features/rules.js';
import { claimTicket, closeTicket, openTicket } from '../features/tickets.js';
import { closeConvocation } from '../features/convocations.js';
import { handleMusicButton } from '../features/music.js';
import { publishPatchNote } from '../features/patchnotes.js';

export const name = Events.InteractionCreate;

export async function execute(client, interaction) {
  try {
    // --- Commandes slash ---
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
      return;
    }

    // --- Boutons ---
    if (interaction.isButton()) {
      const [id, arg] = interaction.customId.split(':');
      switch (id) {
        case 'rules_accept':
          return await handleRulesAccept(interaction);
        case 'ticket_open':
          return await openTicket(interaction, arg);
        case 'ticket_claim':
          return await claimTicket(interaction);
        case 'ticket_close':
          return await closeTicket(interaction);
        case 'convocation_close':
          return await closeConvocation(interaction);
        case 'music':
          return await handleMusicButton(interaction, arg);
      }
      return;
    }

    // --- Modals ---
    if (interaction.isModalSubmit() && interaction.customId === 'patchnote_modal') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const result = await publishPatchNote(client, {
        version: interaction.fields.getTextInputValue('version'),
        title: interaction.fields.getTextInputValue('title'),
        content: interaction.fields.getTextInputValue('content'),
        authorId: interaction.user.id,
        authorTag: interaction.user.tag,
      });
      await interaction.editReply({
        content: result.ok ? '✅ Patch note publié !' : `⚠️ ${result.error}`,
      });
      return;
    }
  } catch (error) {
    console.error('Erreur interaction :', error);
    const payload = { content: '❌ Une erreur est survenue.', flags: MessageFlags.Ephemeral };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(payload).catch(() => null);
    } else if (interaction.isRepliable()) {
      await interaction.reply(payload).catch(() => null);
    }
  }
}
