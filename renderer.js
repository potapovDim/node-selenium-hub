const fs = require('fs')
const appWrapper = require('./lib')



module.exports = {
  testFn: (test) => {
    const browser = JSON.parse(fs.readFileSync(test))
    const app = appWrapper(browser)
    app.listen(9090)
    const a = document.createElement('span')
    a.id = 'test_span'
    const isExists = fs.existsSync(test)
    a.textContent = test + isExists
    document.body.appendChild(a)
  }
}