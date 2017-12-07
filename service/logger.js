module.exports = {
    info: (msg) => {
        console.info(new Date().toLocaleString() + ' INFO ' + msg);
    },
    debug: (msg) => {
        console.debug(new Date().toLocaleString() + ' DEBUG ' + msg);
    },
    warn: (msg) => {
        console.warn(new Date().toLocaleString() + ' WARN ' + msg);
    },
    error: (msg) => {
        console.error(new Date().toLocaleString() + ' ERROR ' + msg);
    }
}