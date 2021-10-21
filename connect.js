// buffer for connections
// calback for connection
// global state buffer
module.exports.connect = (array,init,state) => {
    i = 0
    while (i < config.BOT_COUNT) {
        if ((!array[i]) || (!array[i].open)) {
            let ws = new WebSocket(config.ADDRESS);
            let con = {socket: ws,id: null,open: true,init: false, x: null, y: null, angle: null}
            ws.addEventListener("open", () => {
                init(con,state)
            });
            array[i] = con;
        }
        i ++
    }
}
