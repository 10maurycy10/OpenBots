WebSocket = require("ws")
messagepack = require("msgpack-lite")
express = require("express")

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

if (config.WEB_SERVER) {
const app = express()
const port =  config.WEB_SERVER_PORT

    app.get('/', (req, res) => {
        res.send('This is the openbots web serber')
    })
    app.listen(port, () => {
        console.log(`internal web server http://localhost:${port}`)
    })
}
