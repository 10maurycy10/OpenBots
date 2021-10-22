/* jshint node: true, esversion: 11 */

let rx_last = 0;
let tx_last = 0;

module.exports.getstats = (array,state) => {
    let notconnected = 0;
    let connected = 0;
    let inited = 0;
    let disconnected = 0;
    
    let i = 0;
    while (i < config.BOT_COUNT) {
        if (array[i]) {
            connected ++;
            if (!array[i].open) {
                 disconnected++;
            }
            if (array[i].init) {
                inited++;
            }
        } else {
            notconnected++;
        }
        i++;
    }
    
    let d_rx = rx_total - rx_last;
    let d_tx = tx_total - tx_last;
    
    dbg(`Connected ${connected} | inited ${inited} | kicked ${disconnected} | TX ${d_tx*2} | RX ${d_rx*2} | PING ${state.ping} | DEATHS ${state.deaths}`);
    
    rx_last = rx_total;
    tx_last = tx_total;
};
