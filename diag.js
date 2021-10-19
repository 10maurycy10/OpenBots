module.exports.getstats = (array) => {
    notconnected = 0
    connected = 0;
    inited = 0;
    disconnected = 0;
    
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
    
    dbg(`Connected ${connected} | inited ${inited} | kicked ${disconnected}`)
}
