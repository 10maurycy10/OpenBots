/* jshint node: true, esversion: 11, loopfunc: false */

// buffer for connections
// calback for connection
// global state buffer
module.exports.connect = (array,init,state) => {
    for (let i = 0;i < config.BOT_COUNT;i++) {
        if ((!array[i]) || (!array[i].open)) {
            let ws = new WebSocket(config.ADDRESS);
            let con = {socket: ws,id: null,open: true,init: false, x: null, y: null, angle: null};
            ws.addEventListener("open", () => init(con, state)); // jshint ignore:line
            array[i] = con;
        }
    }
};
