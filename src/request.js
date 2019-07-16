const {
  json2Form,
  isBoolean
} = require('./utils')

const BASE_URL = ''

const VALID_STATUS_CODE = code => code >= 200 && code < 300

const VALID_CACHE = (cacheMaxAge, lastModified) => {
  return lastModified + cacheMaxAge * 1000 >= +new Date()
}

function isGetOrPost (method) {
  return method == 'GET' || method == 'POST'
}

class Request {
  
  constructor () {
    this.baseUrl = BASE_URL
    this.validCache = VALID_CACHE.bind(this, 1800)
    this.validStatusCode = VALID_STATUS_CODE

    this.interceptors = {
      req: {
        use (handler) {
          this.handler = handler
        }
      },
      res: {
        use (handler) {
          this.handler = handler
        }
      }
    }
  }

  _defaultRequest (cache, options) {
    const wxreq = opts => new Promise((resolve, reject) => {
      wx.request({
        ...opts,
        success: res => {
          // { statusCode, data, header }
          if (this.validStatusCode(res.statusCode)) {
            resolve({
              res,
              from: 'server',
            })
            return
          }
          reject(new Error(JSON.stringify(res)))
        },
        fail: err => {
          reject(new Error(err.errMsg))
        }
      })
    })

    const saveData = (url, paramsKey, data) => {
      let hasCached = false
  
      try {
        const cache = wx.getStorageSync(url) || {}
        cache[json2Form(paramsKey)] = {
          data,
          lastModified: +new Date()
        }
        wx.setStorageSync(url, cache)
  
        hasCached = true
      }
      catch (err) {
        hasCached = false
      }
  
      return hasCached
    }

    const requestInterceptor = this.interceptors.req.handler
    if (requestInterceptor) {
      options = requestInterceptor(options) || options
    }

    const { url, method, data } = options

    if (isGetOrPost(method) && cache) {
      const res = wx.getStorageSync(url)
      if (res) {
        const store = res[json2Form(data)]
        if (store && this.validCache(store.lastModified)) {
          return Promise.resolve({
            from: 'cache',
            res: store
          })
        }
      }

      return wxreq(options).then(({ from, res }) => ({
        from, res, hasCached: saveData(url, data, res.data)
      }))
    }

    return wxreq(options).then(({ from, res }) => {
      const responseInterceptor = this.interceptors.res.handler
      if (responseInterceptor) {
        res = responseInterceptor(res) || res
      }

      if (isGetOrPost(method) && isBoolean(cache)) {
        return {
          from, res,
          hasCached: saveData(url, data, res.data)
        }
      }
      return { from, res }
    })
  }

  do (opts) {
    let {
      url,
      params,
      cache,
      method = 'GET',
      header = {
        'Content-Type': 'application/json'
      },
      dataType = 'json',
      responseType = 'text',
    } = opts

    if (!(/^https/.test(url))) {
      if (!this.baseUrl) {
        throw new Error('url is not valid.')
      }
      url = this.baseUrl + url
    }
  
    const { form, ...queryParams } = params
    let data = queryParams
  
    if (method == 'POST' && form != void 0) {
      data = form
      header['Content-Type'] = 'application/x-www-form-urlencoded'
    }

    return this._defaultRequest(cache, {
      url, data, method, header, dataType, responseType
    })
  }

  config (opts) {
    const {
      baseUrl,
      cacheMaxAge,
      validStatusCode,
    } = opts

    baseUrl && (this.baseUrl = baseUrl)
    validStatusCode && (this.validStatusCode = validStatusCode)
    cacheMaxAge && (this.validCache = VALID_CACHE.bind(this, cacheMaxAge))
  }
}

module.exports = new Request()