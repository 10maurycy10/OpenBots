// Configuration options

// must be over 0
module.exports.BOT_COUNT = parseInt(process.env.BOT_COUNT) || 5 

// ping interval should be 500 to resemble a player
module.exports.PING_INTERVAl = 500

// should be arroung 500 - 1000
// set to a low number (1) to cary out a chat flood
module.exports.CHAT_INTERAVL = 1000

// artifical latency added to pings
// set this to non zero to induce lag?
module.exports.FAKE_LAG = 0

// name the bots shold use. leave blank to not send a /name command
module.exports.NAME = "OpenBot"

// Whenter the bots shold have active behavior.
module.exports.DO_STUFF = true

// the names of the inputs for directions
module.exports.MOVES = ["up", "right", "left", "down"]

// set env var to specify target 
module.exports.ADDRESS = process.env.TARGET || "ws://localhost:5000"

// The list of chats that the bot can produce
module.exports.CHATS = ["ICANHASBOT", "over 158 lines of code", "no monkeys in the loop", "KILL ALL HUMANS", "stay still for a moment", "lagggggggg", "[SEGMENTATION FAULT]", "jk", "let me pass", "[BIG RED BUTTON]", "100% artificial", "go watch a cat video", "https://github.com/10maurycy10/OpenBots"]

// add some extra messages depending on platform
if (process.platform == "linux") {
    module.exports.CHATS.push("Linux, and proud of it!")
}
if (process.platform == "freebsd" || process.platform == "openbsd") {
    module.exports.CHATS.push("What is this, BSD?")
}
if (process.platform == "win32") {
    module.exports.CHATS.push("WTF is this, MSDOS?")
}
if (process.platform == "darwin") {
    module.exports.CHATS.push("Careful, this computer is very expensive!")
}

// Should the script have a web server
module.exports.WEB_SERVER = process.env.WEB_SERVER || false

module.exports.WEB_SERVER_PORT = process.env.PORT || 3000

// the interval betwen changing direction
module.exports.MOVE_RANDOM_WALK_TIME = parseInt(process.env.MOVE_RANDOM_WALK_TIME) ||  500

if (process.env.LOG_CONF) {
    console.log(module.exports)
}
