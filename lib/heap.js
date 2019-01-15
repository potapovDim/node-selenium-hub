function HubHeap() {
  this.free = true
  this.heap = []

  this.isFree = async function() {
    return this.free
  }

  this.push = async function(itemWorker) {
    while(await this.isFree()) {
      this.free = false
    }
    this.heap.push(itemWorker)
    this.free = true
    return
  }

  this.find = function(sessionId) {
    return this.heap.find((item) => item.sessionId === sessionId)
  }

  this.remove = async function(sessionId) {
    while(await this.isFree()) {
      this.free = false
    }

    const index = this.heap.findIndex((item) => item.sessionId === sessionId)
    const {driverProc} = this.heap[index]
    driverProc.kill()
    this.heap.splice(index, 1)
    this.free = true
  }
}

module.exports = {
  HubHeap
}