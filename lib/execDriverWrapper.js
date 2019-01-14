const getPort = require('get-port')
const {exec} = require('child_process')

const runPromise = (cmd) => new Promise((res) => {
  const longestTestTime = 45000

  const now = +Date.now()
  const proc = exec(cmd)

  const watcher = setInterval(() => {if(+Date.now() - now > longestTestTime) {clearInterval(watcher); proc.kill(); res(cmd)} }, 15000)

  proc.on('message', (message) => {
    console.log(message)
  })

  proc.on('exit', () => {clearInterval(watcher)})
  proc.stdout.on('data', (data) => {
    console.log(data.toString('utf8'))
    res(proc)
  })
  proc.stderr.on('data', (data) => console.log(data.toString('utf8')))
  proc.on('error', (e) => {console.error(e)})

  proc.on('close', (code) => {})


})


async function wrapExec() {
  const port = await getPort()

  const nodePath = '/Users/dpot/Documents/node-selenium-hub/fake_stub/server1.js'
  console.log('here 1', port)

  const chromeStart = `./chromedriver --port=${port}`
  const proc = await runPromise(chromeStart)
  console.log('here 2')

  return {
    driverProc: proc,
    driverPort: port,
  }
}

module.exports = {
  wrapExec
}