
module.exports = async (edge, oldState, newState) => {
    if (newState?.member?.user.id !== edge.config.discord.clientID) return
    if (newState.serverMute && newState.channelId || newState.suppress && newState.channelId) await newState.member.edit({mute:false})
}