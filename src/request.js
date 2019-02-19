const {
  json2Form,
  isBoolean
} = require('./utils')

function getData (url) {
  return new Promise(resolve => {
    wx.getStorage({
      key: url,
      success: res => {
        console.info('缓存中存在数据\n', `请求地址：${url}`)
        resolve(res.data)
      },
      fail: err => {
        console.info('缓存中无数据或者读取缓存出错\n', `请求地址：${url}`)
        resolve()
      }
    })
  })
}

function saveResponseToCache (url, params, data) {
  try {
    const cache = wx.getStorageSync(url) || {}
    cache[json2Form(params)] = {
      data,
      lastModified: +new Date()
    }
    wx.setStorageSync(url, cache)
    
    console.info('数据已写入缓存\n', `请求地址：${url}`, `请求参数：${json2Form(params)}`)
  }
  catch (err) {
    console.error('数据写入缓存出错\n', `请求地址：${url}`, `请求参数：${json2Form(params)}`)
  }
}

function validStatusCode (statusCode) {
  return statusCode >= 200 && statusCode < 300
}

function validCache (lastModified) {
  return lastModified + 30 * 60 * 1000 >= +new Date()
}

function isGetOrPost (method) {
  return method == 'GET' || method == 'POST'
}

function wxreq (opts) {
  return new Promise((resolve, reject) => {
    console.info('请求服务器数据\n', `请求地址：${opts.url}\n`, `请求参数：${json2Form(opts.data)}`)
    wx.request({
      ...opts,
      success: res => { resolve(res) },
      fail: err => { reject(err.errMsg) }
    })
  })
}

const request = [
  'OPTIONS',
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'DELETE',
  'TRACE',
  'CONNECT',
].reduce((iter, cur) => {
  const method = cur.toLowerCase()
  iter[method] = (url, params, cache, ...opts) => {
    opts = [cur, ...opts]
    return defaultRequest(url, params, cache, ...opts)
  }

  return iter
}, {})

function defaultRequest (url, data, cache, ...opts) {
  const [
    method, header, dataType, responseType
  ] = opts

  function wxreqDone (res) {
    if (validStatusCode(res.statusCode)) {
      const { errorMsg } = res.data
      if (errorMsg) {
        return Promise.reject(errorMsg)
      }

      if (isGetOrPost(method) && isBoolean(cache)) {
        saveResponseToCache(url, data, res.data)
      }

      return res
    }

    return Promise.reject(JSON.stringify(res))
  }

  if (isGetOrPost(method) && cache) {
    return getData(url).then(res => {
      if (res) {
        const store = res[json2Form(data)]
        if (store && validCache(store.lastModified)) {
          return {
            from: 'cache',
            data: store.data
          }
        }
      }
      console.info('缓存中无数据或者缓存已失效\n', `请求地址：${url}\n`, `请求参数：${json2Form(data)}`)

      return wxreq({ url, data, method, header, dataType, responseType })
    })
    .then(res => res.from == 'cache' ? res.data : wxreqDone(res))
    // .catch(err => Promise.reject({ failed: true, errorMsg: err }))
  }

  return wxreq({
    url, data, method, header, dataType, responseType
  })
  .then(wxreqDone)
  // .catch(err => Promise.reject({ failed: true, errorMsg: err }))
}

function init (options) {
  const {
    url,
    params,
    cache,
    header = {
      'Content-Type': 'application/json'
    },
    dataType = 'json',
    responseType = 'text',
    method = 'GET',
    cacheMaxAge,
  } = options

  // CACHE_MAX_AGE = cacheMaxAge

  const { form, ...queryParams } = params
  let _params = queryParams

  if (method == 'POST' && form != void 0) {
    _params = form
    header['Content-Type'] = 'application/x-www-form-urlencoded'
  }

  console.info({ url, params: _params, method, cache, header, dataType, responseType })

  const fn = request[method.toLowerCase()]
  return fn(url, _params, cache, header, dataType, responseType)
}

module.exports = init
