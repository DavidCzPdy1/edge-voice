
const chalk = require('chalk')

process.title = 'By DavidCzPdy'
global.path = process.mainModule.path


/* 
DELAY
@param {time}
@returns {promise}
@usage await delay (ms)
*/
global.delay = ms => new Promise(resolve => setTimeout(resolve, ms))

/* 
DISCORD log
@param {message, footer}
@returns {embed}
@usage console.discord("text")
*/
console.discord = (message, args = {}) => {
  console.log(chalk.bgMagenta.black(`[${getCurrentTime()}] Discord >`) + ' ' + chalk.magenta(message))

  let embed = { title: 'Discord', description: `**${message}**`, color: 2067276, footer: { text: args.startup ? 'settings display soon' : null } }
  if (global.config?.discord.log_channel === true) global.channels?.log?.send({ embeds: [embed] })
  return embed
}

/* 
EMBED log
@param {embed}
@returns {undefined}
@usage console.embed(embed)
*/
console.embed = (embed) => {
  if (global.config?.discord.log_channel === true) global.channels?.log?.send({ embeds: [embed] })
  return
}

/* 
MONGO log
@param {message, footer}
@returns {embed}
@usage console.mongo("text")
*/
console.mongo = (message, args = {}) => {
  console.log(chalk.bgBlue.black(`[${getCurrentTime()}] Mongo >`) + ' ' + chalk.blue(message))

  let embed = { title: 'Mongo', description: `**${message}**`, color: 2067276, footer: { text: args.startup ? 'settings display soon' : null } }
  if (global.config?.discord.log_channel === true) global.channels?.log?.send({ embeds: [embed] })
  return embed
}


/* 
TIME log
@param {message, footer}
@returns {embed}
@usage console.cron("text")
*/
console.cron = (message, args = {}) => {
  console.log(chalk.green.black(`[${getCurrentTime()}] TIME >`) + ' ' + chalk.greenBright(message))

  let embed = { title: 'Time', description: `**${message}**`, color: 2067276, footer: { text: args.startup ? 'settings display soon' : null } }
  if (global.config?.discord.log_channel === true) global.channels?.log?.send({ embeds: [embed] })
  return embed
}


/* 
ERROR log
@param {message, type}
@returns {embed}
@usage await console.error(err, name)
 - await required when stopping bot
*/
console.error = async (message, type = '') => {
  let windows = global.path.slice(0, 5).includes("\\")
  let reg = windows ?
    new RegExp(`${global.path.replaceAll('\\', '\\\\').replace('/', '\\\\')}.*:(\\d.):(\\d.)`) :
    new RegExp(`${global.path}.*:(\\d.):(\\d.)`)

  let path = windows ?
    (String(message.stack).match(reg) ? String(message.stack).match(reg)[0].replace(global.path.replace('/', '\\'), '') : 'unknown path') :
    (String(message.stack).match(reg) ? String(message.stack).match(reg)[0].replace(global.path, '') : 'unknown path')

  let embed = { author: { name: String(message).trim() }, description: type || null, color: 15548997, footer: { text: path !== 'unknown path' ? path : null } }

  //console.log(message)

  console.log(chalk.bgRedBright.black(`[${getCurrentTime()}] Error >`) + ' ' + chalk.redBright(message) + chalk.blueBright(`${path !== 'unknown path' ? ` at ${global.path + path}` : ''}`))
  if (global.config?.log_channel === true) {
    await global.channels?.log?.send({
      embeds: [embed]
    })
  }
  return embed
}


/* 
Default Config
@param {}
@returns {object}
@usage defaultConfig()
 - returns default config
*/
global.defaultConfig = () => {
  return {
    dev: true,
    discord: {
      prefix: 'v!',
      enabled: true,
      log_channel: true,
      clientID: '1135625257810673796',
      serverID: '1105413744902811688',
      loggingChannel: '1106243507527635005',
      voice: {
        enabled: true,
        channel: '1109943572825907243',
        stream: 'https://icecast8.play.cz/radio7-128.mp3'
      },
    },
    time: {},
    keepAlive: false
  }
}


/* 
Get Current Time
@param {}
@returns {string}
@usage getCurrentTime()
 - returns current time
*/
function getCurrentTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}
console.date = getCurrentTime