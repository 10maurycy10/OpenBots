/* jshint node: true, esversion: 11 */

// create a NoOp input state
function createInput() {
	return { up: false, right: false, left: false, down: false, arrowLeft: false, arrowRight: false, space: false };
}

module.exports.createInput = createInput;

//utility to send data to server
module.exports.send = (ws,x) => {
    tx_total ++;
    return ws.send(messagepack.encode(x));
};

let copyed_propertys = ["x","y","dying","radius","angle","name"]

// a small player info object
module.exports.CPlayer = (pack) => { //the new keyword suck. avoid at all costs
    // this avoids alocation
    let init_player_data = (player,pack) => {
        for (var i of copyed_propertys) {
            player[i] = pack[i] ?? player[i]
        }
    };
    let unpacked = {};
    unpacked.snap = (pack) => init_player_data(unpacked,pack);
    init_player_data(unpacked,pack);
    return unpacked;
};
