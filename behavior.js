function processMessage(msg,con) {
	const obj = messagepack.decode(new Uint8Array(msg.data));
    if (obj.type === 'init') {
        con.id = obj.selfId;
    }
}

function init(con) {
    ws = con.socket;
    
    delay = Math.floor(Math.random() * 1000);
    
    send(ws,{chat: `/name ${config.NAME}`})
    
    con.init = true
    
    ws.addEventListener('message', (msg) => {
        processMessage(msg,con)
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
        if (CHAT_MESSAGE !== "") {
            send(ws,{
                chat: config.CHAT_MESSAGE
            })
            //dbg("CHAT " + (con.id || "None").toString())
        }
    },config.CHAT_INTERAVL)
    
    // FIRE!!!
    chat_timer = setInterval(() => {
        let input = lib.createInput();
        input.space = true
        input.arrowRight = true
        send(ws,{input: true, data: input})
        setTimeout(() => {
            input.space = false
            send(ws,{input: true, data: input})
        },1000)
    },1100)
}

module.exports.init = init
