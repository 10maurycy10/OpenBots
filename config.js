// Configuration options

// must be over 0
module.exports.BOT_COUNT = 5 

// ping interval should be 500 to resemble a player
module.exports.PING_INTERVAl = 500

// should be arroung 500 - 1000
// set to a low number (1) to cary out a chat flood
module.exports.CHAT_INTERAVL = 1000

// artifical latency added to pings
// set this to non zero to induce lag?
module.exports.FAKE_LAG = 0

module.exports.NAME = "OpenBot"

module.exports.DO_STUFF = true

module.exports.MOVES = ["up", "right", "left", "down"]

// set env var to specify target 
module.exports.ADDRESS = process.env.TARGET || "ws://localhost:5000"

module.exports.CHATS = ["ICANHASBOT", "over 158 lines of code", "no monkeys in the loop", "KILL ALL HUMANS", "stay still for a moment", "lagggggggg", "[SEGMENTATION FAULT]", "jk", "let me pass", "[BIG RED BUTTON]", "100% artificial", "go watch a cat video", "https://github.com/10maurycy10/OpenBots"]

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
    module.exports.CHATS.push("Careful, this computer is very expencive!")
}

module.exports.WEB_SERVER = true

module.exports.WEB_SERVER_PORT = process.env.PORT || 3000

module.exports.MOVE_RANDOM_WALK_TIME =  500
