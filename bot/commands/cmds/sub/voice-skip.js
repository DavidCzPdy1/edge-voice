
const { useMainPlayer } = require('discord-player');

module.exports = {
    name: 'voice-skip',
    description: 'Skip a song!',
    permissions: [{ id: '378928808989949964', type: 'USER', permission: true}, { id: '1105555145456107581', type: 'ROLE', permission: true}],
    options: [
      {
        name: 'song',
        description: 'Na jakou písničku chceš přeskočit?',
        type: 4,
        required: false,
        autocomplete: true
      },
    ],
    type: 'sub',
    platform: 'discord',
    run: async (edge, interaction) => {
      await interaction.deferReply({ ephemeral: true })
      const player = useMainPlayer();

      let queue = player.queues.cache.get(interaction.guild.id)
      if (!queue) return interaction.editReply({ content: 'Nenašel jsem queue!'})

      if (queue.isEmpty() && !queue.currentTrack) return interaction.editReply({ content: 'Není nic, co můžu přeskočit', ephemeral: true})

      let skip = (interaction.options.getInteger('song') ?? -2) -1


      if (skip == -6) return interaction.editReply({ content: 'Neplatné zadání příkazu!', ephemeral: true})
      try {
        const entry = queue.tasksQueue.acquire();
        await entry.getTask();
      
        if (skip == -3) {
          queue.node.skip()
          interaction.editReply({ content: 'Skipped 1 song'})
        } else if (skip == -2) {
          queue.clear();
          queue.node.skip()
          interaction.editReply({ content: 'Skipped all songs'})
        } else {
          let track = queue.tracks.at(skip);
		      if (!track) return interaction.editReply({ content: `**Požadovaná písnička** neexistuje!`, ephemeral: true });

          queue.node.skipTo(track);
          interaction.editReply({ content: `⏩ | **Skipped** to: **${track.title}**` });
        
        }
      } finally { queue.tasksQueue.release() }



    },
    autocomplete: async (edge, interaction) => {
      const player = useMainPlayer();

      let queue = player.queues.cache.get('1105413744902811688')
      if (!queue) return interaction.respond([ {name: 'Nenašel jsem queue', value: -5} ])

      let track = interaction.options.getInteger('song');

      let focused = interaction.options.getFocused()
      let skip = queue?.tracks.at(track);
      if (!Number(focused) && focused.length) {
        track = queue.tracks.find(n => n.title.toLowerCase().includes(focused?.trim()?.toLowerCase()) || n.description?.toLowerCase()?.replaceAll(' ','')?.trim().includes(focused?.trim()?.replaceAll(' ','')?.toLowerCase()))
        if (track) {
          skip = track;
          track = String(queue?.node.getTrackPosition(skip) + 1)
        }
      }

      let position = queue?.node.getTrackPosition(skip);
      let tracks = queue?.tracks.map((t, i) => ({ name: t.title + ' #' + ++i, value: ++i}));
  
      if (skip?.title && !tracks.some((t) => t.name.split(' #')[0] === skip.title)) tracks.unshift({ name: skip.title + ' #' + position, value: position })
  
      let slicedTracks = tracks.slice(0, 5);
      if (track) {
        slicedTracks = tracks.slice(track - 1, track + 4);
        if (slicedTracks.length > 5) {
          slicedTracks = slicedTracks.slice(0, 5);
        }
      }

      slicedTracks.push({ name: 'Clear queue', value: -1 })
  
      return interaction.respond(slicedTracks);
    }
}