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
    
    dbg(`Connected ${connected} | inited ${inited} | kicked ${disconnected}`)
    //console.log(state)
}
