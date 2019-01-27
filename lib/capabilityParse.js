const fs = require('fs')

function getDriverCmd(pathToBrowserModule) {
  const isExistBrowsersFile = fs.existsSync(pathToBrowserModule)
  if(!isExistBrowsersFile) {
    throw new Error(`${pathToBrowserModule} file was not found, please use absolute path`)
  }
  const browsers = JSON.parse(fs.readFileSync(pathToBrowserModule))

  return (desiredCapabilities) => {
    // hardcode for now, temporary solution
    const {browserName} = desiredCapabilities

    if(browsers[browserName].driver) {
      return browsers[browserName].driver
    }
    throw new Error(`${browserName} was not found in browser JSON`)
  }
}

module.exports = getDriverCmd
