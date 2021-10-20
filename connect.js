// buffer for connections
// calback for connection
module.exports.connect = (array,init) => {
    i = 0
    while (i < config.BOT_COUNT) {
        if ((!array[i]) || (!array[i].open)) {
            let ws = new WebSocket(config.ADDRESS);
            let con = {socket: ws,id: null,open: true,init: false}
            ws.addEventListener("open", () => {
                init(con)
            });
            array[i] = con;
        }
        i ++
    }
}
