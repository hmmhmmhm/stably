const FsLogger = require('fslogger')
const mkdirFull = require('mkdir-recursive')


class FolderLogger {
    constructor(fs){

    }
}
const logger = new FsLogger(__dirname + '/testlog', '[STABLY]')

logger.setLogLevel(3)
logger.log(3, new Date(), 'INFO TEST')
logger.log(1, new Date(), 'ERROR TEST')