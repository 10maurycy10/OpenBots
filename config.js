/* jshint node: true, esversion: 11 */

// Configuration options

let config = {
	BOT_COUNT: 5,
	// ping interval should be 500 to resemble a player
	PING_INTERVAl: 500,
	// should be arroung 500 - 1000
	// set to a low number (1) to cary out a chat flood
	CHAT_INTERAVL: 1000,
	// artifical latency added to pings
	// set this to non zero to induce lag?
	FAKE_LAG: 0,
	// name the bots shold use. leave blank to not send a /name command
	NAME: "OpenBot",
	// Whenter the bots shold have active behavior
	DO_STUFF: true,
	// the names of the inputs for directions
	MOVES: ["up", "right", "left", "down"],
	// address of the game server (should start with "ws://" ot "wss://")
	// example: "wss://darrows-testing.herokuapp.com"
	ADDRESS: "ws://localhost:5000",
	// messages the bots will send
	CHATS: [
		"ICANHASBOT",
		"over 397 lines of code",
		"no monkeys in the loop",
		"KILL ALL HUMANS",
		"stay still for a moment",
		"lagggggggg",
		"[SEGMENTATION FAULT]",
		"jk",
		"let me pass",
		"[BIG RED BUTTON]",
		"100% artificial",
		"go watch a cat video",
		"https://github.com/10maurycy10/OpenBots",
	],
	// Should the script have a web server
	WEB_SERVER: false,
	// Massinve improve pref on large bot counts
	SINGLE_RX: true,
	MOVE_RANDOM_WALK_TIME: 10,
	DONT_ATTACK_SELF: true,
	// the is how mutch the bot will reotate per second
	ARROWING_ANGULAR_SPEED: 2.9,
	IGNORED_NAMES: {},
	MIN_AIM_CYCLES: 6,
	MOVE: true,
	AIM: true,
	SEND_CRASH_PACKET: false,
};

// add some extra messages depending on platform
if (process.platform == "linux") {
	config.CHATS.push("Linux, and proud of it!");
}
if (process.platform == "freebsd" || process.platform == "openbsd") {
	config.CHATS.push("What is this, BSD?");
}
if (process.platform == "win32") {
	config.CHATS.push("WTF is this, MSDOS?");
}
if (process.platform == "darwin") {
	config.CHATS.push("Careful, this computer is very expensive!");
}
// this one is specal for heroku
config.WEB_SERVER_PORT = process.env.PORT || 3000;

for (let envvar in process.env) {
	if (envvar in config) {
		if (process.env[envvar] !== "") {
			config[envvar] = JSON.parse(process.env[envvar]);
		}
	}
}

module.exports = config;

if (process.env.LOG_CONF) {
	console.log(module.exports);
}
