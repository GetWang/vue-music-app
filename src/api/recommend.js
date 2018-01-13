import jsonp from 'common/js/jsonp'
import { commonParams, options } from 'api/config'
import axios from 'axios'

/* 抓取轮播图数据 */
export function getRecommend() {
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    uin: 0,
    needNewCode: 1
  })
  return jsonp(url, data, options)
}

/* 抓取歌单列表数据 */
export function getDiscList() {
  const url = '/api/getDiscList'    // 该接口已事先在本地服务器配置好
  const data = Object.assign({}, commonParams, {
    platform: 'yqq',
    hostUin: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    needNewCode: 0,
    categoryId: 10000000,
    rnd: Math.random(),     // rnd为随机数
    format: 'json'
  })
  return axios.get(url, {   // 通过axios向本地服务器发送Ajax请求，请求歌单数据
    params: data
  }).then((res) => {        // res是一个带有HTTP响应头部数据和实际请求的歌单数据的对象
    return Promise.resolve(res.data)    // res.data是一个实际请求的歌单数据的对象
  })
}

/* 抓取歌单详情数据 */
export function getDiscDetail(disstid) {
  /* 这样获取不到数据，好像还是访问接口受限
  const url = '/api/getDiscDetail'
   */
  const url = 'http://ustbhuangyi.com/music/api/getCdInfo'
  const data = Object.assign({}, commonParams, {
    disstid,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    hostUin: 0,
    platform: 'yqq',
    needNewCode: 0
  })
  return jsonp(url, data, options)
  /* 这样获取不到数据，好像还是访问接口受限
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
   */
}
