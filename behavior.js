/* jshint node: true, esversion: 11 */


function update_players(state,players,con) {
    
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

function processMessage(msg,con,state) {
    rx_total++;
    
    if (!con.do_rx)
        return;
    
	let  obj = messagepack.decode(new Uint8Array(msg.data));
    
    if (obj.type === 'init') {
    	console.log("got init!")
        con.id = obj.selfId;
        state.bots[con.id] = con;
        for (let {data, id } of obj.players) {
			state.players[id] = lib.CPlayer(data);
		}
		if (con.conid != 0 && config.SINGLE_RX)
            con.do_rx = false
    }
    if (obj.d) {
        update_players(state, obj.d.p, con);
    }
    if (obj.type === "newPlayer") {
		state.players[obj.id] = lib.CPlayer(obj.player, obj.id === con.id);
    }
	if (obj.type === 'leave') {
        if (!config.SINGLE_RX) {
            if (obj.id == con.id) {
                send(con.socket,{type: "spawn"});
                state.deaths ++;
            }
        } else {
            console.log(state.cons)
            if (state.bots[obj.id]) {
                let pcon = state.bots[obj.id];
                send(pcon.socket,{type: "spawn"});
                state.deaths ++
            }
        }
        delete state.players[obj.id];
    }
    if (obj.pung != undefined) {
		state.ping = Math.round((Date.now() - obj.pung) / 2);
	}
}

// initalze the connection
function init(con,state,conid) {
    let ws = con.socket;
    let delay = Math.floor(Math.random() * 1000);
    
    send(ws,{joinE: true, character: "Default"});
    
    ws.addEventListener('message', (msg) => {
        processMessage(msg,con,state);
    });

    
    con.init = true;
    con.do_rx = true;
    con.conid = conid;
    
    send(con.socket,{type: "spawn"});
    
    if (config.DO_STUFF)
        setTimeout(init_work,delay,con,ws,state);
}

function init_work(con,ws,state) {
    
    if (config.NAME !== "") {
        send(ws,{chat: `/name ${config.NAME + Math.floor(Math.random() * 1000)}`});
    }

    // ping the server 2 per second
    let ping_timer = setInterval(() => {
        send(ws,{ping: Date.now() - config.FAKE_LAG});
    }, config.PING_INTERVAl);
    // SEND A CHAT
    let chat_timer = setInterval(() => {
        if (config.CHATS.length > 0) {
            send(ws,{
                chat: config.CHATS[Math.floor(Math.random() * config.CHATS.length)]
            });
        }
    },config.CHAT_INTERAVL);
    
    let movingDirection = null;
    let loading = true;
    let arrow_direction = null;
    let can_fire = false;
    let time_loading = 0;
    let aim_cycles = 0;
    
    function update_input() {
        if (config.SEND_CRASH_PACKET) {
            send(ws, {input: [1]});
        }
        let input = lib.createInput();
        if (config.MOVE)
            input[movingDirection ?? config.MOVES[0]] = true;
        input.space = loading;
        
        if (arrow_direction) input[arrow_direction] = true;
        
        send(ws,{input: true, data: input});
    }
    
    function update_aim(target_x, target_y, has_target) {
        
        if (state.players[con.id] && config.SINGLE_RX) {
            con.x = state.players[con.id].x ?? null;
            con.y = state.players[con.id].y ?? null;
            con.angle = state.players[con.id].angle ?? null;
            con.dead = state.players[con.id].dead ?? null;
        }
        
        if (!con.x || !config.AIM) {
            return;
        }
        
        if (con.aim_delay) {return;}
        
        target = Math.atan2(con.y-target_y,con.x-target_x);
        error = (((target - con.angle) + Math.PI*2) % (Math.PI*2)) - Math.PI;
        
        if (error > 0)
            arrow_direction = "arrowRight";
        else
            arrow_direction = "arrowLeft";
    
        update_input();
        
        // dont attemt good aim if ping not known
        if (state.ping === null) return;
        
        let seconds_round_trip = (state.ping * 2 + config.SERVER_TICKS_MS) / 1000;
        
        let angle_per_trip = config.ARROWING_ANGULAR_SPEED * seconds_round_trip;
        
        if (Math.abs(error) < (angle_per_trip+10)) {
        
            let time_to_hold_input_ms = Math.abs(error / config.ARROWING_ANGULAR_SPEED * 1000);
            
            con.aim_delay = true;
            setTimeout(() => {
                arrow_direction = null;
                update_input();
                con.aim_delay = false;
                if (time_loading > 15 && has_target) {
                    loading = false;
                    if (aim_cycles > config.MIN_AIM_CYCLES) { 
                        aim_cycles = 0;
                        time_loading = 0;
                    } else
                        aim_cycles ++;
                    update_input();
                } else {
                    let old = loading;
                    loading = true;
                    if (old != loading)
                        update_input();
                }
            },time_to_hold_input_ms);
        }        
    }
    
    let input_timer = setInterval(() => {
        let target_x = 0;
        let target_y = 0;
        let target_d = Number.MAX_VALUE;
        let has_target = false;
        
        for (var id in state.players) {
            if (state.players.hasOwnProperty(id) && state.players[id] !== undefined && id !== con.id && !((id in state.bots) && config.DONT_ATTACK_SELF ) && !(state.players[id].name in config.IGNORED_NAMES)) {
                player = state.players[id];
                let dx = Math.abs(player.x - con.x);
                let dy = Math.abs(player.y - con.y);
                let d  = Math.sqrt(dx*dx+dy*dy);
                if (d < target_d) {
                    target_d = d;
                    target_x = player.x;
                    target_y = player.y;
                    has_target = true;
                }
            }
        }
        
        update_aim(target_x,target_y,has_target);
    },100);

    let move_timer = setInterval(() => {
        movingDirection = config.MOVES[Math.floor(Math.random() * config.MOVES.length)];
        update_input();
    },config.MOVE_RANDOM_WALK_TIME);
    
    // load timer!
    let fire_timer = setInterval(() => {
            time_loading++;
    },100);
    
    
    
    con.onkick = function() {
        clearInterval(input_timer);
        clearInterval(move_timer);
        clearInterval(chat_timer);
        clearInterval(ping_timer);
        con.open = false;
        con.init = false;
    };
    
    ws.onclose = con.onkick
}

module.exports.init = init;
