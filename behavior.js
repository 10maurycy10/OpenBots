function update_players(state,players,con) {
    for (pack of players) {
        if (!state.players[pack.id]) {
            state.players[pack.id] = lib.CPlayer(pack)
        } else {
            state.players[pack.id].snap(pack.data);
        }
    }
    // maintain updated self info
    if (state.players[con.id]) {
        con.x = state.players[con.id].x ?? null
        con.y = state.players[con.id].y ?? null
        con.angle = state.players[con.id].angle ?? null
    }
}

function processMessage(msg,con,state) {
    rx_total++;
	let  obj = messagepack.decode(new Uint8Array(msg.data));
    if (obj.type === 'init') {
        con.id = obj.selfId;
        state.bots[con.id] = con;
        for ({ data, id } of obj.players) {
			state.players[id] = lib.CPlayer(data);
		}
    }
    if (obj.type === "state") {
        update_players(state, obj.data.players, con)
    }
    if (obj.type === "newPlayer") {
		state.players[obj.id] = lib.CPlayer(obj.player, obj.id === con.id);
	}
	if (obj.type === 'leave') {
		delete state.players[obj.id]
	}
    if (obj.pung != undefined) {
		state.ping = Math.round((Date.now() - obj.pung) / 2)
	}
}

// initalze the connection
function init(con,state) {
    let ws = con.socket;
    
    let delay = Math.floor(Math.random() * 1000);
    
    if (config.NAME !== "") {
        send(ws,{chat: `/name ${config.NAME}`})
    }
    
    con.init = true
    
    ws.addEventListener('message', (msg) => {
        processMessage(msg,con,state)
    });
    if (config.DO_STUFF)
        setTimeout(init_work,delay,con,ws)
}

function init_work(con,ws) {
    // ping the server 2 per second
    let ping_timer = setInterval(() => {
        send(ws,{ping: Date.now() - config.FAKE_LAG})
    }, config.PING_INTERVAl)
    // SEND A CHAT
    let chat_timer = setInterval(() => {
        if (config.CHATS.length > 0) {
            send(ws,{
                chat: config.CHATS[Math.floor(Math.random() * config.CHATS.length)]
            })
        }
    },config.CHAT_INTERAVL)
    
    let movingDirection = null;
    let loading = false;
    let arrow_direction = null;
    
    function update_input() {
        let input = lib.createInput();
        input[movingDirection ?? config.MOVES[0]] = true;
        input["space"] = loading;
        
        if (arrow_direction) input[arrow_direction] = true;
        
        send(ws,{input: true, data: input})
    }
    
    function update_aim(target_x, target_y) {
        
        if (config.DONT_AIM) {
            arrow_direction = "arrowRight";
            return
        }
        
        if (!con.x) {
            return;
        }
        
        if (con.aim_delay) {dbg("aim delay!");return;}
        
        target = Math.atan2(con.y-target_y,con.x-target_x)
        error = (((target - con.angle) + Math.PI*2) % (Math.PI*2)) - Math.PI
        
        if (error > 0)
            arrow_direction = "arrowRight";
        else
            arrow_direction = "arrowLeft";
    
        update_input()
        
        // dont attemt good aim if ping not known
        if (state.ping === null) return;
        
        let seconds_round_trip = (state.ping * 2 + config.SERVER_TICKS_MS) / 1000
        
        let angle_per_trip = config.ARROWING_ANGULAR_SPEED * seconds_round_trip
        
        if (Math.abs(error) < angle_per_trip) {
        
            let time_to_hold_input_ms = Math.abs(error / config.ARROWING_ANGULAR_SPEED * 1000)
            
            if (time_to_hold_input_ms < 2) {return;}
            
            con.aim_delay = true;
            setTimeout(() => {
                arrow_direction = null;
                update_input()
                con.aim_delay = false;
            },time_to_hold_input_ms)
            
        }
    }
    
    let input_timer = setInterval(() => {
        let target_x = 0;
        let target_y = 0;
        let target_d = Number.MAX_VALUE;
        
        for (var id in state.players) {
            if (state.players.hasOwnProperty(id) && state.players[id] !== undefined && id !== con.id && !((id in state.bots) && config.ATTACK_SELF )) {
                player = state.players[id]
                let dx = Math.abs(player.x - con.x)
                let dy = Math.abs(player.y - con.y)
                let d  = Math.sqrt(dx*dx+dy*dy)
                if (d < target_d) {
                    target_d = d
                    target_x = player.x
                    target_y = player.y
                }
            }
        }
        
        update_aim(target_x,target_y)
    },100)

    let move_timer = setInterval(() => {
        movingDirection = config.MOVES[Math.floor(Math.random() * config.MOVES.length)]
        update_input()
    },config.MOVE_RANDOM_WALK_TIME)
    
    // FIRE!!!
    let fire_timer = setInterval(() => {
        loading = true
        update_input();
        setTimeout(() => {
            loading = false
            update_input()
        },config.DONT_AIM ? 1000 : 2000)
    },config.DONT_AIM ? 1100 : 2200)
    
    ws.onclose = function() {
        dbg('Disconnected.')
        clearInterval(chat_timer)
        clearInterval(ping_timer)
        clearInterval(move_timer)
        clearInterval(fire_timer)
        clearInterval(input_timer)
        con.open = false;
    }
}

module.exports.init = init
