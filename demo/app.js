const request = require('./mp-request/index')

App({

  onLaunch: function () {
    request.config()
  },

  globalData: {
    
  }
})