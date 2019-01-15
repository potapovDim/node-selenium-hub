module.exports = (function() {

  const processes = {}

  return {
    storeProcessException: function(pid, error) {
      processes[pid] = error.toString()
    },
    getProcessException: function(pid) {
      return processes[pid]
    },
    removeProcessException: function(pid) {
      Reflect.deleteProperty(processes, pid)
    }
  }
})()