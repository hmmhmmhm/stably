#!/usr/bin/env node

// Load modules
const fs = require('fs')
const path = require('path')
const stably = require('../stably')
const yargs = require('yargs/yargs')

// Differentiate between
// program options and commands.
let parsedOption = []
let slicedArgvs = process.argv.slice(2)
let optionHasExist = false
let optionCollectEnded = false
let parsedCommand = []
for(let slicedArgv of slicedArgvs){
    if(!optionCollectEnded){
        if(slicedArgv[0] == '-'){
            optionHasExist = true
            parsedOption.push(slicedArgv)
            continue
        }
        if(optionHasExist){
            parsedOption.push(slicedArgv)
            optionHasExist = false
            continue
        }else{
            optionCollectEnded = true
            parsedCommand.push(slicedArgv)
        }
    }else{
        parsedCommand.push(slicedArgv)
    }
}
parsedOption = parsedOption.join(' ')
parsedCommand = parsedCommand.join(' ')
const command = parsedCommand

/**
 * @description
 * https://github.com/yargs/yargs/blob/master/docs/api.md
 */
var option = 
    yargs(parsedOption)
        .scriptName('stably')
        .command('<script>', 'The command you want to execute (Ex. node test.js)')
        .command('default', 'You can config the default set-up that you want to use as a default for the global module.')
        .command('email', 'You can config the email information that you want to use as a default for the global module.')
        .command('init', 'This  command will  be create an advanced settings file for stably module in the project folder.')

        .alias('c', 'config')
        .describe('c', 'This refers to the file name to be used as the stably setting code.')
        .default('c', './stably.config.js')

        .alias('m', 'min')
        .describe('m', 'This means the minimum operating time. If the program fails to meet this minimum operating time and an error occurs, the program is completely stopped. (set milliseconds.)')
        .default('m', 1000)

        .alias('r', 'refresh')
        .describe('r', 'You can set this param whether you want to restart the program if there are changes in the source code.')
        .default('r', true)

        .alias('d', 'delay')
        .describe('d', 'You can set the param to this factor value to have the program turn on after a certain amount of time when it restarts.  (set milliseconds.)')
        .default('d', 0)

        .alias('i', 'ignore')
        .describe('i', 'If you enable this option, It  will  be run it right away without using stably.config.js in this project.')
        .default('i', false)

        .alias('e', 'external')
        .describe('e', 'Sets the extension of the file to monitoring.')
        .default('e', 'js,jsx,ts,tsx')

        .alias('t', 'terminal-use')
        .describe('t', 'Select whether to display module message on the terminal.')
        .default('t', true)

        .describe('error-log', 'Choose whether to collect errors that occurred while the program was running.')
        .default('error-log', true)

        .describe('console-log', 'Select whether to collect logs that occurred while the program was running.')
        .default('console-log', false)

        .describe('log-path', 'Set a location to store the logs that occurred while the program was running.')
        .default('log-path', './_log')

        .describe('signal-reboot', 'Rebootable signal that can be executed via an error message.')
        .default('signal-reboot', 'reboot')

        .describe('signal-shutdown', 'Shutdown signal that can be executed via an error message.')
        .default('signal-shutdown', 'shutdown')

        .example(`stably node test.js`, 'An example of a command to run test.js as the without option.\n')
        .example(`stably -c ./stably.config.js -m 1000 -r true -d 0 node test.js`, 'An example of a command to run test.js as the option.')

        .epilogue('For more information, find our manual at http://github.com/hmmhmmhm/stably')
        .help('help')

        .argv

/**
 * @TODO
 * Global Command Processing
 * 
 * 1. 이메일 정보 입력받아서 중앙 모듈에 저장하기
 * 2. 기본설정 옵션 입력받아서 중앙 모듈에 저장하기
 */
switch(command){
    case 'default':
        // TODO: 기본설정 옵션 입력받아서 중앙 모듈에 저장하기
        return
    case 'email':
        // TODO: 이메일 정보 입력받아서 중앙 모듈에 저장하기
        return
    case 'init':
        // TODO: 기본설정 파일 해당 모듈폴더에 저장하기
        return
}

// Load user scripts
const projectPath = process.cwd()
const userScriptPath = path.join(projectPath, `/${option.config}`)
var program = null
if(!option.ignore){
    if(fs.existsSync(userScriptPath)){
        let userScript = require(userScriptPath)
        if(typeof userScript == 'function'){
            let userProgram = userScript(command, option)
            if(typeof userProgram == 'function')
                program = userProgram
        }
    }
}

stably(command, option, program)