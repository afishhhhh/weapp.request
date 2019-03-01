# mp-request

一个为微信小程序提供的，基于 wx.request 扩展的网络请求组件库。

### Features

1. Promise API
2. 缓存控制

### Install

### Quick Start

##### 引入 mp-request

``` javascript
const request = require('mp-request')
```

1. 发送一个 GET 请求

   ``` javascript
   request('https://api.github.com').then(onFulfilled).catch(onRejected)
   ```

   因为所有的 `request` 调用都会返回一个 `Promise`，所以可以使用 `then` 对请求结果进行进一步处理，用 `catch` 来捕获内部抛出的错误。

2. 发送一个 GET 请求，并写入缓存

   ``` javascript
   request('https://api.github.com', {}, {
     cache: true
   })
   ```


3. 发送一个 POST 请求

   ``` javascript
   request.post('https://api.github.com', {
     user: 'afishhhhh'
   })
   ```

   除了 GET 请求以外，所有其他的 method 都要以 `request.method` 的形式进行调用。

   根据[微信官方文档](https://developers.weixin.qq.com/miniprogram/dev/api/wx.request.html#data-%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E)的说明，以上 POST 方法且 `Content-Type` 默认为 `application/json`，会对数据进行 JSON 序列化。

   如果需要以 query string 的形式将数据发送给服务器，可以采取以下调用方法，不需要显示的将 `Content-Type` 写为 `application/x-www-form-urlencoded`：

   ``` javascript
   request.post('https://api.github.com', {
     form: {
       user: 'afishhhhh'
     }
   })
   ```

4. 全局配置

   | 配置选项            | 类型                   | 说明                                       | 必填   | 默认值                                 |
   | :-------------- | -------------------- | ---------------------------------------- | ---- | ----------------------------------- |
   | baseUrl         | `String|Undefined`   | 基础请求路径                                   | 否    |                                     |
   | cacheMaxAge     | `Number|Undefined`   | 缓存有效期，时间单位为秒                             | 否    | 1800                                |
   | validStatusCode | `Function|Undefined` | status code 合法区间，该函数接受一个参数，并返回一个 `Boolean` | 否    | `code => code >= 200 && code < 300` |

   ``` javascript
   request.config({
     baseUrl: 'https://api.github.com'
   })
   ```

### APIs

#####  `request(url, params, options)`

发起一个 GET 请求。

**`params`**：请求参数，类型为 `Object`，非必填。

**`options`**：配置项，类型为 `Object`，非必填，可以有以下属性值：

| 属性           | 类型                  | 必填   | 默认值         | 说明                                       |
| ------------ | ------------------- | ---- | ----------- | ---------------------------------------- |
| cache        | `Boolean|Undefined` | 否    | `undefined` | `undefined` 表示从服务器获取最新数据，不写入缓存；`true` 表示优先从缓存中获取数据，如果缓存中不存在该数据或者缓存已失效，则从服务器获取数据，并写入缓存；`false` 表示优先从服务器获取数据，并将数据写入缓存 |
| header       |                     |      |             | 同微信官方文档                                  |
| dataType     |                     |      |             | 同微信官方文档                                  |
| responseType |                     |      |             | 同微信官方文档                                  |



##### `request.method(url, params, options)`

`method` 可以是 `get`，`post` 等等。



##### `request.config(options)`

**`options`**：配置项，类型为 `Object`。

### License

This code is distributed under the terms and conditions of the [MIT license](LICENSE).

