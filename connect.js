/* jshint node: true, esversion: 11, loopfunc: false */

// buffer for connections
// calback for connection
// global state buffer
module.exports.connect = (array,init,state) => {
    for (let i = 0;i < config.BOT_COUNT;i++) {
        if ((!array[i]) || (!array[i].open)) {
            let ws = new WebSocket(config.ADDRESS);
            let e = i + 0;
            ws.onerror = (error) => {
                console.log(error);
                if (array[e].onkick)
                    array[e].onkick
                delete array[e]
            }
            let con = {socket: ws,id: null,open: true,init: false, x: null, y: null, angle: null};
            ws.addEventListener("open", () => init(con, state, i)); // jshint ignore:line
            array[i] = con;
        }
    }
};
