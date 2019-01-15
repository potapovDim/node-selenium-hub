const Koa = require('koa2')
const bodyParser = require('koa-bodyparser')
const {wrapExec} = require('./execDriverWrapper')
const {getDriverCmd} = require('./capabilityParse')
const {HubQueue} = require('./queue')

const app = new Koa()

app.use(bodyParser())

const workQueue = new HubQueue()

const sessionRegExp = /(?<=session\/)(\d|\w|-)+/

const methodsMap = {
  DELETE: 'del',
  POST: 'post',
  GET: 'get',
  PUT: 'put'
}

app.use(async (ctx) => {

  const {url, body, method} = ctx.request

  if(url === '/session' && body.desiredCapabilities && method === 'POST') {

    const driverCmd = getDriverCmd(body.desiredCapabilities)

    const {driverProc, request} = await wrapExec(driverCmd)

    const resp = await request.post(url, body)
    ctx.body = resp.body

    await workQueue.push({
      request, sessionId: resp.body.sessionId, driverProc
    })
  } else if(url === '/session' && method === 'DELETE') {
    const sessionId = url.match(sessionRegExp)[0]
    const {request} = workQueue.find(sessionId)
    const resp = await request[methodsMap[method]](url, body)
    ctx.body = resp.body
    await workQueue.remove(sessionId)
  } else {
    const sessionId = url.match(sessionRegExp)[0]
    const {request} = workQueue.find(sessionId)
    const resp = await request[methodsMap[method]](url, body)
    ctx.body = resp.body
  }
  return ctx
})

app.listen(9090)
