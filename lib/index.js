// packages requiring
const Koa = require('koa2')
const bodyParser = require('koa-bodyparser')
// app module requiring
const {wrapExec} = require('./execDriverWrapper')
const {getDriverCmd} = require('./capabilityParse')
const {HubHeap} = require('./heap')
const requestWrapper = require('./request')
const {findSessionIdValue} = require('./util')

const app = new Koa()

app.use(bodyParser())

const workHeap = new HubHeap()

const sessionRegExp = /(?<=session\/)(\d|\w|-)+/

app.use(async (ctx) => {

  const {url, body, method} = ctx.request
  /*
  * current heap status
  * return array with {browserName, sessionId} objects
  */
  if(url === '/status' && method === 'GET') {
    ctx.body = workHeap.getHeapCondition()
    return ctx
  }

  /*
  * if request to this hub does not contain session
  * this request is not related to wire protocol
  * or hub heap status
  */
  if(!url.includes('session')) {
    ctx.body =
      'This request in not related to current API \n' +
      'You can use /status for information about current sessions and browsers \n' +
      'Or any language bindings for browser automation testing'

    return ctx
  }


  if(url === '/session' && body.desiredCapabilities && method === 'POST') {

    const driverCmd = getDriverCmd(body.desiredCapabilities)

    const {driverProc, host} = await wrapExec(driverCmd)

    const request = requestWrapper(host)
    const resp = await request[method](url, body)
    const sessionId = findSessionIdValue(resp)

    ctx.body = resp.body

    await workHeap.push({
      request, sessionId, driverProc, browserName: body.desiredCapabilities.browserName
    })
  } else {
    const sessionId = url.match(sessionRegExp)[0]

    const {request} = workHeap.find(sessionId)
    const resp = await request[method](url, body)

    ctx.body = resp.body

    if(method === 'DELETE' && url === `/session/${sessionId}`) {await workHeap.remove(sessionId)}
  }
  return ctx
})

app.listen(9090)
