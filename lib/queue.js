// {
//   request, sessionId, driverProc
// }
function HubQueue() {
  this.free = true
  this.queue = []

  this.isFree = async function() {
    return this.free
  }

  this.push = async function(itemWorker) {
    while(await this.isFree()) {
      this.free = false
    }
    this.queue.push(itemWorker)
    this.free = true
    return
  }

  this.find = function(sessionId) {
    return this.queue.find((item) => item.sessionId === sessionId)
  }

  this.remove = async function(sessionId) {
    while(await this.isFree()) {
      this.free = false
    }

    const index = this.queue.findIndex((item) => item.sessionId === sessionId)
    const {driverProc} = this.queue[index]
    driverProc.kill()
    this.queue.splice(index, 1)
    this.free = true
  }
}

module.exports = {
  HubQueue
}