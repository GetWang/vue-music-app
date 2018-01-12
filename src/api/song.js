import { getUid } from 'common/js/uid'
import jsonp from 'common/js/jsonp'
import axios from 'axios'
import { commonParams, options } from './config'

/* 获取请求歌曲时需要的验证key */
export function getVKey(songmid, filename) {
  const url = 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg'
  const data = Object.assign({}, commonParams, {
    cid: 205361747,
    format: 'json',    // 将format由网站上的jsonp改为json，是为了让本次请求获取到的响应数据为json格式
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    uin: 0,
    songmid,
    filename,
    guid: getUid()
  })
  return jsonp(url, data, Object.assign({}, options, {
    param: 'callback'
  }))
}

/* 使用axios向本地服务器（Node）发送Ajax请求，请求歌曲歌词的数据 */
export function getLyric(mid) {
  const url = '/api/lyric'
  const data = Object.assign({}, commonParams, {
    pcachetime: +new Date(),
    songmid: mid,
    loginUin: 0,
    hostUin: 0,
    platform: 'yqq',
    needNewCode: 0,
    format: 'json'
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
