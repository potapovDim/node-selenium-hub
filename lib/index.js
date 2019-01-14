const Koa = require('koa2')
const bodyParser = require('koa-bodyparser')
const requestInterface = require('./request')
const {wrapExec} = require('./execDriverWrapper')

const app = new Koa()
app.use(bodyParser())

// queueObj

const tempQueue = []

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
    const {driverPort, driverProc, request} = await wrapExec()
    const resp = await request.post(url, body)
    ctx.body = resp.body

    tempQueue.push({
      request, sessionId: resp.body.sessionId, driverProc
    })
    return ctx
  } else {
    const sessionId = url.match(sessionRegExp)[0]
    const {request} = tempQueue.find((item) => item.sessionId === sessionId)
    const resp = await request[methodsMap[method]](url, body)
    ctx.body = resp.body
    return ctx
  }
  return ctx
})

app.listen(9090)
