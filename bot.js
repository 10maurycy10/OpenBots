/* jshint node: true, esversion: 11 */

// lite has better preofrmace in this usecase
const express = require("express");

const config = require("./config.js");
const diag = require("./diag.js");
const connect = require("./connect.js");
const behavior = require("./behavior.js");

let cons = [];

// shared state buffer
let state = {players: {}, bots: {}, ping: null, deaths: 0, cons: cons, config, rx_total: 0, tx_total: 0, serverTickMs: 16};

if (config.SEND_CRASH_PACKET)
	console.warn("SEND_CRASH_PACKET is true, this will CRASH the server!");

// Connect to server
setInterval(connect.connect, 1000, cons, behavior.init, state, config);

// print stats
setInterval(diag.getstats, 500, cons, state);

// start web server
if (config.WEB_SERVER) {
	const app = express();
	const port = config.WEB_SERVER_PORT;

	app.get("/", (req, res) => {
		res.send(
			"This is the openbots web server. This can be used for uptime monitoring and preventing dyno/runner sleep in heroku/replit"
		);
	});
	app.listen(port, () => {
		console.log("internal web server http://localhost:${port}");
	});
}
