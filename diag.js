rx_last = 0
tx_last = 0

module.exports.getstats = (array,state) => {
    let notconnected = 0
    let connected = 0;
    let inited = 0;
    let disconnected = 0;
    
    i = 0
    while (i < config.BOT_COUNT) {
        if (array[i]) {
            connected ++
            if (!array[i].open) {
                 disconnected++;
            }
            if (array[i].init) {
                inited ++;
            }
        } else {
            notconnected ++;
        }
        i ++
    }
    
    let d_rx = rx_total - rx_last
    let d_tx = tx_total - tx_last
    
    dbg(`Connected ${connected} | inited ${inited} | kicked ${disconnected} | TX ${d_tx*2} | RX ${d_rx*2}`)
    
    rx_last = rx_total
    tx_last = tx_total
    //console.log(state)
}
