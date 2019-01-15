function getDriverCmd(desiredCapabilities) {
  // hardcode for now, temporary solution
  const browsers = require('../browsers.json')
  const {browserName} = desiredCapabilities
  if(browsers[browserName]) {
    return browsers[browserName]
  }
  throw new Error(`${browserName} was not declare in browser JSON`)
}

module.exports = {
  getDriverCmd
}
