// Configuration options

// must be over 0
module.exports.BOT_COUNT = 10

// ping interval should be 500 to resemble a player
module.exports.PING_INTERVAl = 500

// should be arroung 500 - 1000
// set to a low number (1) to cary out a chat flood
module.exports.CHAT_INTERAVL = 1000

// set this to blank to prevent sending
module.exports.CHAT_MESSAGE = "Open bots!!"

// artifical latency added to pings
// set this to non zero to induce lag?
module.exports.FAKE_LAG = 0

module.exports.NAME = "OpenBots"

module.exports.DO_STUFF = true

module.exports.MOVES = ["up", "right", "left", "down"]

module.exports.ADDRESS = "ws://darrows.herokuapp.com"

// uncomment to connect to local instance
//module.exports.ADDRESS = "ws://localhost:5000"
