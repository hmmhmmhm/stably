/**
 * @TODO
 * 1. [v] -min 최소 작동시간 체크 후 유효값보다 작으면 프로그램 종료 
 * 2. [v] -refresh 소스코드 변경시 자동재시작 토글 기능 추가
 * 3. [v] -delay 재시작시  기다리는 기능 추가
 * 4. [v] 안전한 재부팅 시그널 
 * 5. [ ] -l --log 
 * 6. [ ] 이용자가 Ctrl+C 로 끌경우 감지(현재 맥만 작동)
 * 7. [ ] 정기보고?
 */

const fs = require('fs')
const path = require('path')
const nodemon = require('nodemon')
const cli = require('nodemon/lib/cli')
const bus = require('nodemon/lib/utils/bus')
const config = require('nodemon/lib/config')
const strErrParser = require('string-error-parse')
const folderLogger = require('folder-logger')

// Main Logger
var logger = null

// Here is the most recent error string.
var lastError = null

// Obtain stdio data from the child process.
bus.on('stdout', (text)=>{
    if(logger === null){
        console.log(String(text))
    }else{
        logger.info(String(text), {noFormat: true, noWrite: true})
        logger.info(String(text), {noPrint: true})
    }

    /**
     * @TODO 일반 로그 이벤트발생
     */
})
bus.on('stderr', (text)=>{
    lastError = String(text)

    /**
     * @TODO 크래시 로그 이벤트발생
     */
})

// Stably Main Function
const stably = (command, option, program)=>{
    let initTimestamp = new Date().getTime()
    let nodemonOption = cli.parse(`nodemon ${command}`)

    if(option.ignore) nodemonOption.ignore = ['*']
    nodemonOption.ext = option.external.split(',').join(' ')
    nodemonOption.stdout = false
    nodemon(nodemonOption)

    if(option.consoleLog || option.errorLog){
        if(logger === null)
            logger = new folderLogger(path.join(process.cwd(), option.logPath))
    }

    let restartSigned = false

    // Nodemon EventHandler
    nodemon.on('start', () => {
        if(option.terminalUse){
            logger.warn('App has been started.')
            console.log(' ')
        }

    }).on('quit', () => {
        if(option.terminalUse)
            logger.warn('Program terminated successfully (Quit).')
        process.exit()

    }).on('exit', ()=>{
        if(!restartSigned){
            if(option.terminalUse)
                logger.warn('Program terminated successfully. (Exit)')

            /**
             * @TODO 정상종료 이벤트 발생
             */
            process.exit()
        }else{
            restartSigned = false
        }

    }).on('restart', (files) => {
        if(option.terminalUse)
            logger.warn(`Program restarted due to: ${files}`)
        restartSigned = true

    }).on('crash', ()=>{
        nodemon.removeAllListeners()

        let throwCommand = lastError
        let parsedError = null

        try{
            parsedError = strErrParser(lastError)
            throwCommand = String(parsedError.main.text).toLowerCase()
        }catch(e){
            throwCommand = `${throwCommand.replace(/[\r\n\t\b]/gi, '')}`
        }

        let crashTimestamp = new Date().getTime()
        let crashTimeCheck = crashTimestamp - initTimestamp
        if(crashTimeCheck < option.min){
            logger.critical(String(lastError), {noFormat: true})
            if(option.terminalUse)
            logger.critical(`Program has been terminated, It failed fill in the minimum Op-time (${crashTimeCheck}ms < ${option.min}ms)`)
            setTimeout(()=>{
                process.exit()
            }, 3000)
        }else{

            // Processing App Commands.
            switch(throwCommand){
                case option.signalReboot:
                    if(option.terminalUse)
                        logger.warn('Program has requested a reboot...')
                    break
                case option.signalShutdown:
                    if(option.terminalUse){
                        logger.warn('Program has requested a shutdown...')
                        logger.warn('Program terminated successfully.')
                    }
                    process.exit()

                    /**
                     * @TODO 정상종료 이벤트
                     */
                    break
                default:
                    if(option.terminalUse){
                        logger.error('An error occurred in the program.')
                        if(parsedError !== null){
                            logger.error(`Error:     ${parsedError.main.text}`)
                            logger.error(`Line:  ${parsedError.main.lineText}`)
                            logger.error(`Location:  ${parsedError.main.fileName}:${parsedError.main.lineNumber}\n`)
                        }
                    }
                    logger.error(String(lastError), {noFormat: true, noPrint: true})

                    /**
                     * @TODO 크래시 이벤트
                     */
                    break
            }

            if(option.delay != 0){
                if(option.terminalUse)
                    logger.warn(`App will be restart in ${option.delay} ms...`)
            }

            setTimeout(()=>{
                if(option.terminalUse)
                    logger.warn('Reboot..')
                stably(command, option, program)
            }, option.delay)
        }
        
    })
}

module.exports = stably