var express = require('express')
var config = require('./config/index')
var axios = require('axios')

var port = process.env.PORT || config.build.port

var app = express()

var apiRoutes = express.Router()

/* 获取推荐页面歌单列表数据 */
apiRoutes.get('/getDiscList', function (req, res) {   // 为推荐页面的歌单数据接口作路由
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
  axios.get(url, {                // 通过axios向目标服务器发送HTTP请求，获取歌单数据
    headers: {
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    params: req.query
  }).then((response) => {   // response是从目标服务器返回的带有HTTP响应头部数据和实际请求的歌单数据的一个对象
    /* response.data是实际请求的歌单数据的一个对象，调用res.json()是将response.data转化成JSON数据格式，并作为
       res返回。res是要返回给浏览器的响应数据，是一个带有HTTP响应头部数据和实际请求的歌单数据的对象 */
    res.json(response.data)
  }).catch((e) => {
    console.log(e)
  })
})

/* 获取歌手详情页面歌曲的歌词数据 */
apiRoutes.get('/lyric', function(req, res) {
  const url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'
  axios.get(url, {
    headers: {
      referer: 'https://c.y.qq.com',
      host: 'c.y.qq.com'
    },
    params: req.query
  }).then((response) => {
    let ret= response.data
    /* 我们希望服务器返回JSON形式的数据，但如果ret是一个JSONP形式的数据，
       即一个回调函数包裹实际数据的字符串，则从中提取出有效数据，并解析成对象 */
    if (typeof ret === 'string') {
      const reg = /^\w+\(({.+})\)$/
      const matches = ret.match(reg)
      if (matches) {
        ret = JSON.parse(matches[1])
      }
    }
    res.json(ret)
  }).catch((err) => {
    console.log(err)
  })
})

/* 获取歌单详情页面数据 */
apiRoutes.get('/getDiscDetail', function(req, res) {
  const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
  axios.get(url, {
    headers: {
      referer: 'https://c.y.qq.com',
      host: 'c.y.qq.com'
    },
    params: req.query
  }).then((response) => {
    let ret = response.data
    if (typeof ret === 'string') {
      const reg = /^\w+\(({.+})\)$/
      const matches = ret.match(reg)
      if (matches) {
        ret = JSON.parse(matches[1])
      }
    }
    res.json(ret)
  }).catch((err) => {
    console.log(err)
  })
})

// 本地服务器路由接口
app.use('/api', apiRoutes)

// 使用静态资源
app.use(express.static('./dist'))

// 监听端口
module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }
  console.log('Listening at http://localhost:' + port +'\n')
})
