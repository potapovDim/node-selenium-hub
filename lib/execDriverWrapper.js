const getPort = require('get-port')
const {exec} = require('child_process')
const requestWorker = require('./request')


async function waitUntilUrlAvaliable(host) {
  const request = requestWorker(host)
  try {
    await request.get('/')
    return request
  } catch(e) {
    if(e.toString().includes('ECONNREFUSED')) {
      return waitUntilUrlAvaliable(host)
    } else {
      throw e
    }
  }
}


const runPromise = (cmd) => new Promise((res) => {
  // const longestTestTime = 45000

  const now = +Date.now()
  const proc = exec(cmd)


  proc.on('message', (message) => {
    console.log(message)
  })

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
  const chromeStart = `./chromedriver --port=${port}`
  const proc = await runPromise(chromeStart)
  const host = `http://localhost:${port}`

  const request = await waitUntilUrlAvaliable(host)

  return {
    driverProc: proc,
    driverPort: port,
    request
  }
}

module.exports = {
  wrapExec
}