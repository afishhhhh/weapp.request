const request = require('weapp.request')

Page({

  data: {

  },

  onLoad: function () {
    request.config({
      baseUrl: 'https://api.github.com/'
    })
  },

  firstBtnTapped () {
    request('users/afishhhhh')
    .then(console.log)
  },

  secondBtnTapped () {
    request('users/afishhhhh', {}, {
      cache: false
    })
    .then(console.log)
  },

  thirdBtnTapped () {
    request('users/afishhhhh', {}, {
      cache: true,
    })
    .then(console.log)
  },

  fourthBtnTapped () {
    request.get('search/repositories', {
      q: 'weapp.request',
      page: 1,
      per_page: 5
    })
    .then(console.log)
  },

  updateCacheMaxAge () {
    request.config({
      cacheMaxAge: 1
    })
  },

  clearCache () {
    wx.clearStorage()
  },
})
