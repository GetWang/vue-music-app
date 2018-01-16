import jsonp from 'common/js/jsonp'
import { commonParams, options } from './config'

/* 获取搜索页面热门搜索词 */
export function getHotKey() {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'
  const data = Object.assign({}, commonParams, {
    uin: 0,
    platform: 'h5',
    needNewCode: 1
  })
  return jsonp(url, data, options)
}

/* 根据query获取搜索结果数据 */
export function search(query, page, zhida, perpage) {
  const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
  const data = Object.assign({}, commonParams, {
    w: query,          // 设置搜索词query
    perpage,           // 表示每页应该有多少个数据
    n: perpage,        // 也表示每页应该有多少个数据
    p: page,           // 设置请求搜索结果的第几页
    catZhida: zhida ? 1 : 0,   // 设置搜索结果中是否要出现歌手数据
    zhidaqu: 1,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    uin: 0,
    platform: 'h5',
    needNewCode: 1,
    remoteplace: 'txt.mqq.all'
  })
  return jsonp(url, data, options)
}
