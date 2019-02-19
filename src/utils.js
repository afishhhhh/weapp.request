function json2Form (json) {
  const arr = []
  for (let p in json) {
    arr.push(`${p}=${json[p]}`)
  }
  
  return arr.join('&')
}

function isObject (obj) {
  return obj !== null && typeof obj == 'object'
}

function isUndefined (value) {
  return value === void 0
}

function isBoolean (value) {
  return typeof value == 'boolean'
}

module.exports = {
  json2Form,
  isObject,
  isUndefined,
  isBoolean,
}