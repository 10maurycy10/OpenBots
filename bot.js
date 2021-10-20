WebSocket = require("ws")
messagepack = require("messagepack")

config = require("./config.js")
diag = require("./diag.js")
connect = require("./connect.js")
lib = require("./lib.js")
behavior = require("./behavior.js")

dbg = (x) => console.info(x)
send = lib.send

// Connect to server
cons = []
setInterval(connect.connect,1000,cons,behavior.init)

// print stats
setInterval(diag.getstats,500,cons)

