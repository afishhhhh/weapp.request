const {
  isObject,
  isUndefined,
  isBoolean,
} = require('./utils')

function initOptions (url, params, options) {
  if (!(/^https/.test(url))) {
    url = request.baseUrl + url
  }

  const _options = {
    url, params,
    cacheMaxAge: request.cacheMaxAge,
  }

  if (isObject(options)) {
    let {
      header, dataType, responseType, cache
    } = options

    if (!(isUndefined(cache) || isBoolean(cache))) {
      cache = void 0
    }

    Object.assign(_options, {
      header, dataType, responseType, cache,
    })
  }

  return _options
}

function request (url, params, options) {
  if (typeof url !== 'string') {
    throw new Error('url is not valid.')
  }

  if (!isObject(params)) {
    throw new Error('params is not valid.')
  }

  const _options = initOptions(url, params, options)

  return request.promisify(_options)
}

function verbFunc (verb) {
  const method = verb.toUpperCase()
  return function (url, params, options) {
    if (typeof url !== 'string') {
      throw new Error('url is not valid.')
    }

    if (!isObject(params)) {
      throw new Error('params is not valid.')
    }

    const _options = initOptions(url, params, options)
    _options.method = method

    return request.promisify(_options)
  }
}

[
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
  iter[method] = verbFunc(method)

  return iter
}, request)

request.baseUrl = ''
request.cacheMaxAge = 1800 // s
request.promisify = require('./request')

module.exports = request
