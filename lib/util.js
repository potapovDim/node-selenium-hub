// const example = {
//   body: {
//     // value: {
//     sessionId: 'fbdbf9e5-b739-b247-8200-1c7eda974519',
//     capabilities: []
//     // }
//   }
// }
function sleep(time = 125) {
  return new Promise((res) => {
    setTimeout(() => res(), time)
  })
}

function findSessionIdValue(responseObj, currentId = '') {
  const keys = Object.keys(responseObj)
  const sessionId = keys.reduce((acc, key) => {
    if(key === 'sessionId') {
      acc = responseObj[key]
    } else if(typeof responseObj[key] === 'object') {
      acc = findSessionIdValue(responseObj[key], acc)
    }
    return acc
  }, currentId)
  if(sessionId.length) {
    return sessionId
  }
  throw new Error('Session id was not found')
}

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

module.exports = {
  findSessionIdValue,
  waitUntilUrlAvaliable
}
