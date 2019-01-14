const Koa = require('koa2')
const bodyParser = require('koa-bodyparser')

const request = require('request')
const {wrapExec} = require('./execDriverWrapper')

const app = new Koa()
app.use(bodyParser())

// queueObj

const tempQueue = []

const methodsMap = {
  DELETE: 'delete',
  POST: 'post',
  GET: 'get',
  PUT: 'put'
}

app.use(async (ctx) => {
  const {method} = ctx.request
  const {driverPort, driverProc} = await wrapExec()
  const {url, body} = ctx.request
  console.log(url, body)
  const reqResponse = await request[methodsMap[method]](`http://localhost:${driverPort}`)


  ctx.body = reqResponse
})

app.listen(9090)