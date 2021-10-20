WebSocket = require("ws")
messagepack = require("msgpack-lite")

config = require("./config.js")
diag = require("./diag.js")
connect = require("./connect.js")
lib = require("./lib.js")
behavior = require("./behavior.js")

dbg = (x) => console.info(x)
send = lib.send
state = {players: []}

// Connect to server
cons = []
setInterval(connect.connect,1000,cons,behavior.init,state)

// print stats
setInterval(diag.getstats,500,cons,state)

