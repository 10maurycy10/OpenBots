/* jshint node: true, esversion: 11 */

let rx_last = 0;
let tx_last = 0;

// print stats about the program
module.exports.getstats = (array, state) => {
	let connected = 0;
	let inited = 0;
	let disconnected = 0;

	let i = 0;
	while (i < state.config.BOT_COUNT) {
		if (array[i]) {
			connected++;
			if (!array[i].open) {
				disconnected++;
			}
			if (array[i].init) {
				inited++;
			}
		}
		i++;
	}

	let d_rx = state.rx_total - rx_last;
	let d_tx = state.tx_total - tx_last;

	console.log(
		`Connected ${connected} | inited ${inited} | kicked ${disconnected} | TX ${
			d_tx * 2
		} | RX ${d_rx * 2} | PING ${state.ping} | DEATHS ${state.deaths}`
	);
	//    dbg(state.players);
	rx_last = state.rx_total;
	tx_last = state.tx_total;
};
