const pubSub = (function() {
  const subscribers = {}

  return {
    subscribe: function(action, listener) {
      if(!subscribers[action]) {subscribers[action] = []}
      const index = subscribers[action].push(listener) - 1

      return {
        remove: function() {
          subscribers[action].splice(index, 1)
        }
      }
    },
    publish: function(action, data) {
      if(!subscribers[action]) return
      // execute action
      subscribers[action].forEach(function(subscriber) {
        subscriber(data)
      })
    }
  }
})()