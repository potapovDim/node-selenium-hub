/* heap object example
  request,
  sessionId,
  driverProc,
  browserName,
  startTime
*/

function Mutex() {
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
    console.log(this.heap.length)
    this.free = true
  }

  this.find = async function(sessionId) {

    while(await this.isFree()) {
      this.free = false
    }
    console.log(this.heap.length)
    const item = this.heap.find((item) => item.sessionId === sessionId)
    this.free = true
    return item
  }

  this.getHeap = function() {
    return this.heap
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

  this.getHeapCondition = function() {
    return this.heap.map(({sessionId, browserName}) => ({sessionId, browserName}))
  }
}

function sessionWatcher(mutex, time) {
  setInterval(() => {
    const heap = mutex.getHeap()
    heap.forEach(async ({sessionId, startTime}) => {
      if(Date.now() - startTime < time) {await mutex.remove(sessionId)}
    })
  })
}

module.exports = {
  sessionWatcher,
  Mutex
}
