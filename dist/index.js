const r = require('./request')
const {
  isObject,
  isUndefined,
  isBoolean,
  isString,
} = require('./utils')

function initOptions (url, params, options) {
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

function request (url, params = {}, options) {
  if (!isString(url)) {
    throw new Error('url must be a string.')
  }

  if (!isObject(params)) {
    throw new Error('params is must be a object.')
  }

  const _options = initOptions(url, params, options)

  return r.do(_options)
}

function verbFunc (verb) {
  const method = verb.toUpperCase()
  return function (url, params = {}, options) {
    if (!isString(url)) {
      throw new Error('url must be a string.')
    }

    if (!isObject(params)) {
      throw new Error('params must be a object.')
    }

    const _options = initOptions(url, params, options)
    _options.method = method

    return r.do(_options)
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

request.config = function globalConfig (options = {}) {
  const {
    baseUrl,
    cacheMaxAge,
    validStatusCode
  } = options

  if (!isUndefined(baseUrl)) {
    if (!isString(baseUrl)) {
      throw new Error('baseUrl must be a string.')
    }
    if (!(/^https/.test(baseUrl))) {
      throw new Error('baseUrl is not valid.')
    }
  }

  if (!isUndefined(cacheMaxAge) && typeof cacheMaxAge != 'number') {
    throw new Error('cacheMaxAge must be a number.')
  }

  if (!isUndefined(validStatusCode) && typeof validStatusCode != 'function') {
    throw new Error('validStatusCode must be a function that takes an argument and return a boolean.')
  }
  
  r.config({
    baseUrl,
    cacheMaxAge,
    validStatusCode
  })
}

module.exports = request