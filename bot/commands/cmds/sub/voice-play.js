
const { useMainPlayer, QueryType } = require('discord-player');
const Extractors = require('@discord-player/extractor')
const fs = require('fs')
const path = require('path');

module.exports = {
    name: 'voice-play',
    description: 'Play a song!',
    permissions: [{ id: '378928808989949964', type: 'USER', permission: true}, { id: '1105555145456107581', type: 'ROLE', permission: true}],
    options: [
      {
        name: 'query',
        description: 'Jakou chceš písničku?',
        type: 3,
        required: true,
        autocomplete: true
      },
      {
        name: 'options',
        description: 'Where should I look?',
        type: 3,
        required: false,
        choices: [
          { name: 'Všude', value: 'all' },
          { name: 'Soubory', value: 'files' },
          { name: 'YouTube', value: 'YouTubeExtractor' },
        ]
      },
    ],
    type: 'sub',
    platform: 'discord',
    run: async (edge, interaction) => {
      await interaction.deferReply({ ephemeral: true })

      let song = interaction.options.getString('query')


      let channel = dc_client.channels.cache.get(edge.config.discord.voice.channel)

      const player = useMainPlayer();

      let queue = player.queues.cache.get(interaction.guild.id)
      if (!queue) queue = player.queues.create(channel.guild, { skipOnNoStream: false, volume: 100, leaveOnEnd: false, leaveOnEmpty: false})
        

        let tracks = [];

        let type = song.split('➜')[0]
        if (type == 'LF') {
          let filePath =  path.join(__dirname, `../../../${song.split('➜')[1]}`)

          let data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../songs/list.json'), 'utf8')).list.find(n => n.file == song.split('➜')[1])
          if (!data) return interaction.editReply({content: 'Nenašel jsem písničku v databázi!'})

          let search = await player.search(filePath, { searchEngine: QueryType.FILE });
          if (!search.hasTracks()) return interaction.editReply({content: 'Nenašel jsem žádnou písničku!'})

          let track = search.tracks[0]

          track.title = data.name
          track.author = data.author || track.author
          track.duration = `${Math.floor(data.duration/60)}:${Math.floor(data.duration%60)}`
          track.description = [data.sourceName.split('.')[0], data.name, data.artist].filter(n => n).join(' | ')
          
          tracks.push(track)
        } else if (type == 'PL') {
          let playlist = edge.playlists[song.split('➜')[1]]
          tracks = playlist.tracks.sort(() => Math.random() - 0.5)
        } else {
         let search = await player.search(song, { });
         if (!search.hasTracks()) return interaction.editReply({content: 'Nenašel jsem žádnou písničku!'})
         tracks.push(search.tracks[0])
        }
    

        try {
          const entry = queue.tasksQueue.acquire();
          await entry.getTask();
        
          queue.addTrack(tracks);
          let currentTrack = queue.currentTrack?.metadata
          if (currentTrack?.title == 'radio7-128.mp3') queue.node.skip()


          interaction.editReply({ content: `**Added:** ${tracks.length}\n**Names:** ${tracks.map(n => n.title).join(', ')}`, ephemeral: true})
          
          return
        } finally { queue.tasksQueue.release() }

      

      

      interaction.editReply({ content: 'Nějaký error', ephemeral: true})

    },
    autocomplete: async (edge, interaction) => {

      let options = interaction.options.getString('options')
      let query = interaction.options.getString('query', true);

      let results;

      if (!query) results = []
      else if (options == 'files' || !options) results = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../songs/list.json'), 'utf8')).list.map(n => ({name: n.name, value: 'LF➜' + n.file, album: n.album, authors: n.authors, special: [n.sourceName.split('.')[0], n.name, n.artist].filter(n => n).join(' | ')?.replaceAll(' ', '').toLowerCase()}))
      else {
        let searchEngine = options && !(options === 'all') ? `ext:${Extractors[options].identifier}` : 'auto'
        let player = useMainPlayer();
        results = await player.search(query || config.discord.voice.stream, { searchEngine: searchEngine })
        results = results.tracks.map(t => {
          let title = t.title == 'radio7-128.mp3' ? 'Rádio 7' : ((t.title?.slice(0, 50) || '661Errors661') + (t.raw.source ? ` (${t.raw.source})` : ''))
          return {name: title, value: t.url}
        }).filter(a => !a.name.startsWith('661Errors661'))
      }

      results = results.filter(n => n.value.length < 100)
      
      let focused = interaction.options.getFocused()
      let z = results.filter(n => n.name.toLowerCase().includes(focused.toLowerCase()) || n.album?.toLowerCase().includes(focused.toLowerCase()) || n.authors?.some(a => a?.toLowerCase().includes(focused.toLowerCase())) || n.value?.toLowerCase().includes(focused.toLowerCase()) || n.special?.includes(focused.replaceAll(' ', '').trim()?.toLowerCase())).slice(0, 25)
      return interaction.respond(z.length ? z : [{ name: 'Rádio 7', value: 'https://icecast8.play.cz/radio7-128.mp3' }, { name: 'MixCeske Playlist', value: 'PL➜MixCeske' }, { name: 'Y&F Playlist', value: 'PL➜Y&F' }, { name: 'All Songs', value: 'PL➜all' }])
    }
}