const getPort = require('get-port')
const {exec} = require('child_process')
const requestWorker = require('./request')

const runPromise = (cmd) => new Promise((res) => {

  const now = +Date.now()
  const proc = exec(cmd)


  proc.on('message', (message) => {
    console.log(message)
  })

  proc.stdout.on('data', (data) => {
    console.log(data.toString('utf8'))

  })
  proc.stderr.on('data', (data) => console.log(data.toString('utf8')))
  proc.on('error', (e) => {console.error(e)})

  proc.on('close', (code) => {})
  setTimeout(() => {
    res(proc)
  }, 250)
})


async function wrapExec(driverCmd = './chromedriver') {
  const port = await getPort()
  const chromeStart = `${driverCmd} --port=${port}`
  const proc = await runPromise(chromeStart)
  const host = `http://localhost:${port}`

  return {
    driverProc: proc,
    driverPort: port,
    host
  }
}

module.exports = {
  wrapExec
}