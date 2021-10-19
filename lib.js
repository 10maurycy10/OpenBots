// create a NoOp input state
function createInput() {
	return { up: false, right: false, left: false, down: false, arrowLeft: false, arrowRight: false, space: false }
}

module.exports.createInput = createInput;

//utility to send data to server
module.exports.send = (ws,x) => ws.send(messagepack.encode(x))
