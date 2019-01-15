const URL = require('url')
const fetch = require('node-fetch')

async function waitUntilUrlAvaliable(request) {
  try {
    return request()
  } catch(e) {
    if(e.toString().includes('ECONNREFUSED')) {
      await sleep()
      return waitUntilUrlAvaliable(request)
    } else {
      throw e
    }
  }
}

async function _fetchy(method, host, path, body, opts = {}) {

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

  const contentType = response.headers.get("content-type")
  if(contentType && contentType.includes("application/json")) {
    const body = await response.json()
    return {body, status: response.status, headers: response.headers}
  } else {
    return {body: await response.text(), status: response.status, headers: response.headers}
  }
}

module.exports = (host) => ({
  GET: _fetchy.bind(global, "GET", host),
  PUT: _fetchy.bind(global, "PUT", host),
  POST: _fetchy.bind(global, "POST", host),
  DELETE: _fetchy.bind(global, "DELETE", host)
})
