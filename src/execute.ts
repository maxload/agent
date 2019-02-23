import { exec } from 'child_process'
import log from './log'

type listenerFn = (line: string) => void

const defaultOut = (line: string) => log(line, 'info')
const defaultErr = (line: string) => log(line, 'error')

const eachLine = (cb: listenerFn) => {
  let data = ''
  return (chunk: any) => {
    data += chunk
    const lines = data.split('\n')
    while (lines.length > 1) {
      cb(lines.shift() || '')
    }
    data = lines.join('\n')
  }
}

export default function executeCommand(
  command: string,
  outFn: listenerFn = defaultOut,
  errFn: listenerFn = defaultErr,
) {
  return new Promise((resolve, reject) => {
    const spawn = exec(command)
    let errString = ''
    if (outFn) spawn.stdout.on('data', eachLine(outFn))
    spawn.stderr.on('data', eachLine(line => {
      if (errFn) errFn(line)
      errString += line
    }))

    spawn.on('close', code => {
      if (code > 0) {
        reject(new Error(`command '${command} exited with code ${code}':\n${errString}`))
        return
      }
      resolve()
    })
  })
}
