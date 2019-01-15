const URL = require('url')
const fetch = require('node-fetch')

const processExceptionStore = require('./processExceptionStore')

// DANGER ZONE this code should be refactored and removed
// this is temporary solution for local environment
async function waitUntilUrlAvaliable(request) {
  try {
    return request()
  } catch(e) {
    if(e.toString().includes('ECONNREFUSED')) {
      await sleep()
      return waitUntilUrlAvaliable(request)
    } else {
      return e
    }
  }
}

async function _fetchy(method, host, path, body, opts = {}) {

  // this is temporary solution, this _fetchy
  // funtion will be binded to

  const url = URL.resolve(host, path)
  const headers = opts.headers || {}

  if(method == "GET") body = undefined

  if(body != null) {
    headers["Content-Type"] = "application/json"
  }
  function wrapRequest() {
    return () =>
      fetch(url, Object.assign({
        method, headers, body: typeof body === 'object' ? JSON.stringify(body) : body
      }, opts))
  }

  const request = wrapRequest()

  const response = await waitUntilUrlAvaliable(request)

  // this case need for proc exception handler
  // this is temporary
  if(response instanceof Error) {
    const pid = this.pid
    const procException = processExceptionStore.getProcessException(pid)

    if(procException) {
      return {
        body: {
          error: response,
          WebDriverError: procException
        }
      }
    } else {
      return {
        body: {
          error: response
        }
      }
    }
  }

  const contentType = response.headers.get("content-type")
  if(contentType && contentType.includes("application/json")) {
    const body = await response.json()
    return {body, status: response.status, headers: response.headers}
  } else {
    return {body: await response.text(), status: response.status, headers: response.headers}
  }
}

module.exports = (proc, host) => ({
  GET: _fetchy.bind(proc, "GET", host),
  PUT: _fetchy.bind(proc, "PUT", host),
  POST: _fetchy.bind(proc, "POST", host),
  DELETE: _fetchy.bind(proc, "DELETE", host)
})
