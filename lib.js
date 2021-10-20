// create a NoOp input state
function createInput() {
	return { up: false, right: false, left: false, down: false, arrowLeft: false, arrowRight: false, space: false }
}

module.exports.createInput = createInput;

//utility to send data to server
module.exports.send = (ws,x) => {
    tx_total ++;
    return ws.send(messagepack.encode(x))
}

// a small player info object
module.exports.CPlayer = (pack) => { //the new keyword suck. avoid at all costs
    // this avoids alocation
    let init_player_data = (player,pack) => {
        player.x = pack.x ?? player.x;
        player.y = pack.y ?? player.y;
        player.dying = pack.dying ?? player.dying;
        player.radius = pack.radius ?? player.radius;
    }
    let unpacked = {}
    unpacked.snap = (pack) => init_player_data(unpacked,pack)
    init_player_data(unpacked,pack)
    return unpacked
}
