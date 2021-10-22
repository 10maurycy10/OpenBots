/* jshint node: true, esversion: 11 */

WebSocket = require("ws");
// lite has better preofrmace in this usecase
messagepack = require("msgpack-lite");
express = require("express");

config = require("./config.js");
diag = require("./diag.js");
connect = require("./connect.js");
lib = require("./lib.js");
behavior = require("./behavior.js");

// helper functions and bindings
dbg = (x) => console.info(x);
send = lib.send;

// shared state buffer
let state = {players: {}, bots: {}, ping: null, deaths: 0};

tx_total = 0;
rx_total = 0;

// Connect to server
let cons = [];
setInterval(connect.connect,1000,cons,behavior.init,state);

// print stats
setInterval(diag.getstats,500,cons,state);

// start web server
if (config.WEB_SERVER) {
const app = express();
const port =  config.WEB_SERVER_PORT;

    app.get("/", (req, res) => {
        res.send("This is the openbots web server. This can be used for uptime monitoring and preventing dyno/runner sleep in heroku/replit");
    });
    app.listen(port, () => {
        console.log("internal web server http://localhost:${port}");
    });
}
