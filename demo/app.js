const request = require('weapp.request')

App({

  onLaunch: function () {
    request.config()
  },

  globalData: {
    
  }
})