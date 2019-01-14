const fakeServer = require('test-fake-server')

const port = Number(process.env.PORT)

const model = {
  port,
  api: [
    {
      method: 'GET',
      path: '/',
      response: {
        test: 3
      }
    },
    {
      method: 'POST',
      path: '/',
      response: {
        test: 3
      }
    }
  ]
}


fakeServer(model)