// packages requiring
const Koa = require('koa2')
const bodyParser = require('koa-bodyparser')
// app module requiring
const {wrapExec} = require('./execDriverWrapper')
const getDriverCmdWrapper = require('./capabilityParse')
const {Mutex, sessionWatcher} = require('./mutex')
const requestWrapper = require('./request')
const {findSessionIdValue} = require('./util')

const app = new Koa()

app.use(bodyParser())

const workMutex = new Mutex()

const sessionRegExp = /(?<=session\/)(\d|\w|-)+/

/**
 *
 * @param {string} browsers // path to browsers json file
 */
function wrapAppSpoce(browsers, time = 1 * 1000 * 60) {
  sessionWatcher(workMutex, time)
  const getDriverCmd = getDriverCmdWrapper(browsers)
  app.use(async (ctx) => {

    const {body, method} = ctx.request
    let {url} = ctx.request
    if(url.includes('/wd/hub')) {
      url = url.replace('/wd/hub', '')
    }
    /*
    * current heap status
    * return array with {browserName, sessionId} objects
    */
    if(url === '/status' && method === 'GET') {
      ctx.body = workMutex.getHeapCondition()
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
      console.log(driverProc, host)

      // driver proc will be used as binding this argument !!!!!!!!
      // this is temporary solution

      const request = requestWrapper(driverProc, host)
      const resp = await request[method](url, body)
      const sessionId = findSessionIdValue(resp)

      ctx.body = resp.body
      console.log('here')
      await workMutex.push({
        request,
        sessionId,
        driverProc,
        startTime: Date.now(),
        browserName: body.desiredCapabilities.browserName
      })


    } else {
      const sessionId = url.match(sessionRegExp)[0]
      console.log('SESSION ID ', sessionId)
      const {request} = await workMutex.find(sessionId)
      const resp = await request[method](url, body)

      ctx.body = resp.body

      if(method === 'DELETE' && url === `/session/${sessionId}`) {await workMutex.remove(sessionId)}
    }
    return ctx
  })
  return app
}


module.exports = wrapAppSpoce
