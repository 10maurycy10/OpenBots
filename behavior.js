function update_players(state,players,con) {
    for (pack of players) {
        if (!state.players[pack.id]) {
            state.players[pack.id] = lib.CPlayer(pack)
        } else {
            state.players[pack.id].snap(pack.data);
        }
    }
}

function processMessage(msg,con,state) {
	const obj = messagepack.decode(new Uint8Array(msg.data));
    if (obj.type === 'init') {
        con.id = obj.selfId;
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
}

function init(con,state) {
    ws = con.socket;
    
    delay = Math.floor(Math.random() * 1000);
    
    send(ws,{chat: `/name ${config.NAME}`})
    
    con.init = true
    
    ws.addEventListener('message', (msg) => {
        processMessage(msg,con,state)
    });
    ws.onclose = function() {
        dbg('Disconnected.')
        clearInterval(chat_timer)
        clearInterval(ping_timer)
        con.open = false;
    }
    if (config.DO_STUFF)
        setTimeout(init_work,delay,con,ws)
}

function init_work(con,ws) {
    // ping the server 2 per second
    ping_timer = setInterval(() => {
        send(ws,{ping: Date.now() - config.FAKE_LAG})
    }, config.PING_INTERVAl)
    // SEND A CHAT
    chat_timer = setInterval(() => {
        if (config.CHATS.length > 0) {
            send(ws,{
                chat: config.CHATS[Math.floor(Math.random() * config.CHATS.length)]
            })
        }
    },config.CHAT_INTERAVL)
    
    // FIRE!!!
    chat_timer = setInterval(() => {
        let input = lib.createInput();
        input.space = true
        const move_direction = config.MOVES[Math.floor(Math.random() * config.MOVES.length)];
        input[move_direction] = true;
        input.arrowRight = true
        send(ws,{input: true, data: input})
        setTimeout(() => {
            input.space = false
            send(ws,{input: true, data: input})
        },1000)
    },1100)
}

module.exports.init = init
