/* jshint node: true, esversion: 11 */
const pather = require("./path.js");
const lib = require("./lib.js");
const PATHING_SCALE = 50;
const send = lib.send;
const messagepack = require("msgpack-lite")

function update_players(state, players, con) {
	for (let pack of players) {
		if (!state.players[pack.id]) {
			state.players[pack.id] = lib.CPlayer(pack);
		} else {
			state.players[pack.id].snap(pack.data);
		}
	}
	// maintain updated self info
	if (state.players[con.id]) {
		con.x = state.players[con.id].x ?? null;
		con.y = state.players[con.id].y ?? null;
		con.angle = state.players[con.id].angle ?? null;
		con.dead = state.players[con.id].dead ?? null;
	}
}

// (re)Compute a lookuptable for pathfinding
function rebuild_pathing_table(state) {
	if (!state.arena) return;

	console.log("rebuilding pathing table");
	var table_width = Math.ceil(state.arena.width / PATHING_SCALE);
	var table_height = Math.ceil(state.arena.height / PATHING_SCALE);

	console.log(table_width, table_height, state.obstacles);

	// Initalize the table with all trues...
	var table = Array.from(Array(table_width), () => new Array(table_height));
	for (var x = 0; x < table_width; x++)
		for (var y = 0; y < table_height; y++) table[x][y] = true;

	// for all obsticles
	for (var obs of state.obstacles) {
		// if not a hardpoint...
		if (obs.type != "point") {
			var obs_start_x = Math.floor(obs.x / PATHING_SCALE);
			var obs_start_y = Math.floor(obs.y / PATHING_SCALE);
			var obs_end_x = Math.ceil((obs.width + obs.x) / PATHING_SCALE);
			var obs_end_y = Math.ceil((obs.height + obs.y) / PATHING_SCALE);
			for (var x = obs_start_x; obs_end_x > x; x++)
				for (var y = obs_start_y; obs_end_y > y; y++)
					if (x < table_height && x > -1 && y < table_width && y > -1)
						table[x][y] = false;
		}
	}

	for (var y = 0; y < table_height; y++) {
		var buf = "|";
		for (var x = 0; table_width > x; x++) {
			buf = buf.concat(table[x][y] ? " " : "#");
		}
		console.log(buf + "|");
	}
	state.pathingtable = table;
}

function pathfind(startx, starty, endx, endy, state) {
	if (!state.pathingtable) return;

	function moves(node) {
		return [
			[node[0] - 1, node[1]],
			[node[0], node[1] + 1],
			[node[0] + 1, node[1]],
			[node[0], node[1] - 1],
		];
	}
	function is_goal(node) {
		return node[0] == endx && node[1] == endy;
	}
	function is_passable(node) {
		if (node[0] < 0 || node[0] >= state.pathingtable.length) return false;
		if (node[1] < 0 || node[1] >= state.pathingtable[0].length) return false;
		return state.pathingtable[node[0]][node[1]];
	}
	return pather([startx, starty], moves, is_passable, is_goal);
}

function processMessage(msg, con, state) {
	state.rx_total++;
	let obj = messagepack.decode(new Uint8Array(msg.data));

	if (obj.hit)
		state.kills++

	if (!con.do_rx) return;

	if (obj.type === "init") {
		console.log("got init!");
		con.id = obj.selfId;
		state.bots[con.id] = con;
		for (let {data, id} of obj.players) {
			state.players[id] = lib.CPlayer(data);
		}
		if (con.conid != 0 && state.config.SINGLE_RX) con.do_rx = false;
	}
	if (obj.d) {
		update_players(state, obj.d.p, con);
	}
	if (obj.type === "newPlayer") {
		state.players[obj.id] = lib.CPlayer(obj.player, obj.id === con.id);
	}
	if (obj.obstacles) {
		if (obj.obstacles != state.obstacles) {
			state.obstacles = obj.obstacles;
			rebuild_pathing_table(state);
		}
	}
	if (obj.arena) {
		state.arena = obj.arena;
		rebuild_pathing_table(state);
	}
	if (obj.type === "leave") {
		if (!state.config.SINGLE_RX) {
			if (obj.id == con.id) {
				send(con.socket, {type: "spawn"}, state);
				state.deaths++;
			}
		} else {
			if (state.bots[obj.id]) {
				let pcon = state.bots[obj.id];
				send(pcon.socket, {type: "spawn"}, state);
				state.deaths++;
			}
		}
		delete state.players[obj.id];
	}
	if (obj.pung != undefined) {
		state.ping = Math.round((Date.now() - obj.pung) / 2);
	}
	if (obj.serverTickMs) {
		state.serverTickMs = obj.serverTickMs
	}
}

// initalze the connection
function init(con, state, conid) {
	let ws = con.socket;
	let delay = Math.floor(Math.random() * 1000);

	send(ws, {joinE: true, character: "Default"}, state);

	ws.addEventListener("message", (msg) => {
		processMessage(msg, con, state);
	});

	con.init = true;
	con.do_rx = true;
	con.conid = conid;

	//send(con.socket,{type: "spawn"});

	if (state.config.DO_STUFF) setTimeout(init_work, delay, con, ws, state);
}

function init_work(con, ws, state) {
	if (state.config.NAME !== "") {
		send(ws, {
			chat: `/name ${state.config.NAME + Math.floor(Math.random() * 1000)}`,
		},state);
	}

	// ping the server 2 per second
	let ping_timer = setInterval(() => {
		send(ws, {ping: Date.now() - state.config.FAKE_LAG}, state);
	}, state.config.PING_INTERVAl);
	// SEND A CHAT
	let chat_timer = setInterval(() => {
		if (state.config.CHATS.length > 0) {
			send(ws, {
				chat: state.config.CHATS[Math.floor(Math.random() * state.config.CHATS.length)],
			}, state);
		}
	}, state.config.CHAT_INTERAVL);

	let movingDirection = null;
	let loading = true;
	let arrow_direction = null;
	let time_loading = 0;
	let aim_cycles = 0;
	let path = [];
	let path_stale = true;

	function update_input() {
		if (state.config.SEND_CRASH_PACKET) {
			send(ws, {input: [1]}, state);
		}
		let input = lib.createInput();
		if (state.config.MOVE && movingDirection) input[movingDirection] = true;
		input.space = loading;

		if (arrow_direction) input[arrow_direction] = true;

		send(ws, {input: true, data: input}, state);
	}

	function update_aim(target_x, target_y, has_target) {
		if (state.players[con.id] && state.config.SINGLE_RX) {
			con.x = state.players[con.id].x ?? null;
			con.y = state.players[con.id].y ?? null;
			con.angle = state.players[con.id].angle ?? null;
			con.dead = state.players[con.id].dead ?? null;
		}

		if (!con.x || !state.config.AIM) {
			return;
		}

		if (con.aim_delay) {
			return;
		}

		var target = Math.atan2(con.y - target_y, con.x - target_x);
		var error = ((target - con.angle + Math.PI * 2) % (Math.PI * 2)) - Math.PI;

		if (error > 0) arrow_direction = "arrowRight";
		else arrow_direction = "arrowLeft";

		update_input();

		// dont attemt good aim if ping not known
		if (state.ping === null) return;

		let seconds_round_trip = (state.ping * 2 + 30) / 1000;

		let angle_per_trip = state.config.ARROWING_ANGULAR_SPEED * seconds_round_trip;

		if (Math.abs(error) < angle_per_trip + 10) {
			let time_to_hold_input_ms = Math.abs(
				(error / state.config.ARROWING_ANGULAR_SPEED) * 1000
			);

			con.aim_delay = true;
			setTimeout(() => {
				arrow_direction = null;
				update_input();
				con.aim_delay = false;
				if (time_loading > 15 && has_target) {
					loading = false;
					if (aim_cycles > state.config.MIN_AIM_CYCLES) {
						aim_cycles = 0;
						time_loading = 0;
					} else aim_cycles++;
					update_input();
				} else {
					let old = loading;
					loading = true;
					if (old != loading) update_input();
				}
			}, time_to_hold_input_ms);
		}
	}

	let input_timer = setInterval(() => {
		let target_x = 0;
		let target_y = 0;
		let target_d = Number.MAX_VALUE;
		let has_target = false;

		for (var id of Object.keys(state.players)) {
			if (
				id !== con.id &&
				!(id in state.bots && state.config.DONT_ATTACK_SELF) &&
				!(state.players[id].name in state.config.IGNORED_NAMES)
			) {
				var player = state.players[id];
				let dx = Math.abs(player.x - con.x);
				let dy = Math.abs(player.y - con.y);
				let d = Math.sqrt(dx * dx + dy * dy);
				if (d < target_d) {
					target_d = d;
					target_x = player.x;
					target_y = player.y;
					has_target = true;
				}
			}
		}

		if (has_target) {
			if (path_stale) {
				path = pathfind(
					Math.floor(con.x / PATHING_SCALE),
					Math.floor(con.y / PATHING_SCALE),
					Math.floor(target_x / PATHING_SCALE),
					Math.floor(target_y / PATHING_SCALE),
					state
				);
				if (path != null) path_stale = false;
			}
		}

		update_aim(target_x, target_y, has_target);
	}, 100);

	let move_timer = setInterval(() => {
		if (path == null || path == []) {
			// if we dont have a path, fallback to random walk
			movingDirection =
				state.config.MOVES[Math.floor(Math.random() * state.config.MOVES.length)];
			console.log("falling back to random walk");
			update_input();
			return;
		}

		var path_x = Math.floor(con.x / PATHING_SCALE);
		var path_y = Math.floor(con.y / PATHING_SCALE);
		//movingDirection = config.MOVES[Math.floor(Math.random() * config.MOVES.length)];
		var path_idx = path.findIndex(
			(node) => node[0] == path_x && node[1] == path_y
		);
		if (path_idx == -1) path_stale = true;
		else {
			if (path_idx != path.length - 1) {
				var moveto = path[path_idx + 1];
				if (moveto[0] > path_x) movingDirection = "right";
				else if (moveto[0] < path_x) movingDirection = "left";
				else if (moveto[1] > path_y) movingDirection = "down";
				else if (moveto[1] < path_y) movingDirection = "up";
				else movingDirection = "null";
			} else {
				console.log("not on path!");
				path_stale = true;
			}
		}
		update_input();
	}, state.config.MOVE_RANDOM_WALK_TIME);

	// load timer!
	let fire_timer = setInterval(() => {
		time_loading++;
	}, 100);

	con.onkick = function () {
		clearInterval(input_timer);
		clearInterval(move_timer);
		clearInterval(chat_timer);
		clearInterval(ping_timer);
		clearInterval(fire_timer);
		con.open = false;
		con.init = false;
	};

	ws.onclose = con.onkick;
}

module.exports.init = init;
