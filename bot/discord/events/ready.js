
const { useMainPlayer, QueryType } = require('discord-player');
const fs = require('fs')
const path = require('path');

module.exports = async (edge, client) => {

    console.discord('Client ready, logged in as ' + client.user.tag, {startup: true})
    client.user.setPresence({ activities: [ { name: 'Frisbee Games', type: 3 }, {name: 'Radio 7', type: 2} ], status: "online"})

    global.channels = {}
    global.channels.log = global.config.discord.loggingChannel ? await client.channels.fetch(global.config.discord.loggingChannel).catch(console.error) : null

    let voiceChannel = await dc_client.channels.fetch(edge.config.discord.voice.channel)
    let player = useMainPlayer()
    await player.extractors.loadDefault();
    edge.discord.radio = await player.search(config.discord.voice.stream, {requestedBy: client.user}).then(n => n.tracks[0])
    player.queues.create(voiceChannel.guild, { skipOnNoStream: false, volume: 100, leaveOnEnd: false, leaveOnEmpty: false, leaveOnStop: false, pauseOnEmpty: false})

    /* Playlits */
    let songsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../songs/list.json'), 'utf8'))
    songsData.playlists.push('all')
    for (let playlist of songsData.playlists) {
        let songs = songsData.list.filter(n => n.group == playlist || playlist == 'all')
        let tracks = []
        for (let song of songs) {
            let filePath =  path.join(__dirname, `../../${song.file}`)
            let search = await player.search(filePath, { searchEngine: QueryType.FILE });
            if (!search.hasTracks()) continue;
            let track = search.tracks[0]

            track.title = song.name
            track.author = song.author || track.author
            track.duration = `${Math.floor(song.duration/60)}:${Math.floor(song.duration%60)}`
            track.description = [song.sourceName.split('.')[0], song.name, song.artist].filter(n =>n).join(' | ')
            
            tracks.push(track)
        }
        
        let data = {
            tracks: tracks,
            type: 'playlist'
        }
        let seznam = player.createPlaylist(data)
        edge.playlists[playlist] = seznam
    }
    

    let botSlashCmds = edge.commands.filter(n => !n.guild || n.guild.includes('global')).filter(n => n.type == 'slash' || n.type == 'modal').map(cmd => { return { name: cmd.name, description: cmd.description||"", options: cmd.options || [], default_member_permissions: Array.isArray(cmd.permissions) ? (cmd.permissions.length ? false : true) : true } });
    let userCommands = edge.commands.filter(n => !n.guild || n.guild.includes('global')).filter(n => n.type == 'user').map(cmd => { return {name: cmd.name, type: 2}})

    try {
        await client.application.commands.set(botSlashCmds.concat(userCommands))
    } catch (e) { console.error(e)}

    for (let guild of client.guilds.cache) {
        guild = guild[1]
        let guildSlashCmds = edge.commands.filter(n => n.guild && n.guild.includes(guild.id)).filter(n => n.type == 'slash' || n.type == 'modal').map(cmd => { return { name: cmd.name, description: cmd.description||"", options: cmd.options || [], default_member_permissions: Array.isArray(cmd.permissions) ? (cmd.permissions.length ? 0 : undefined) : undefined } });
        let guildUserCmds = edge.commands.filter(n => n.guild && n.guild.includes(guild.id)).filter(n => n.type == 'user').map(cmd => { return {name: cmd.name, type: 2}})
        await guild.commands.set(guildSlashCmds.concat(guildUserCmds))
    }
}