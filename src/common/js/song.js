import { getVKey } from 'api/song'
import { getUid } from './uid'
import { ERR_OK } from 'api/config'

/* 保存每一个歌曲id对应的歌曲url */
let urlMap = {}

export default class Song {
  constructor({ id, name, singer, mid, album, duration, image }) {
    this.id = id
    this.name = name
    this.singer = singer
    this.mid = mid
    this.album = album
    this.duration = duration
    this.image = image
    // 暂时还不知道filename属性是什么，不过应该和获取歌曲需要验证有关
    this.filename = `C400${this.mid}.m4a`
    /* 确保每首歌曲的id只对应一个url，同一个id的歌曲不再生成新的url */
    if (urlMap[this.id]) {
      this.url = urlMap[this.id]
    } else {
      this._genUrl()
    }
  }
  /* 根据歌曲实例的mid、filename生成歌曲的url */
  _genUrl() {
    if (this.url) {
      return
    }
    getVKey(this.mid, this.filename).then((res) => {
      if (res.code === ERR_OK) {
        const vkey = res.data.items[0].vkey
        this.url = `http://dl.stream.qqmusic.qq.com/${this.filename}?vkey=${vkey}&guid=${getUid()}&uin=0&fromtag=66`
        urlMap[this.id] = this.url
      }
    })
  }
}

/* 构造歌曲实例的工厂函数，使得能复用代码，便于集中维护 */
export function createSong(musicData) {
  return new Song({
    id: musicData.songid,
    name: musicData.songname,
    singer: filterSinger(musicData.singer),
    mid: musicData.songmid,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`
  })
}

/* 处理一下歌曲的歌手名字（注意歌手可能有多个） */
export function filterSinger(singer) {
  let ret = []
  /* 处理边界：歌曲没有歌手名 */
  if (!singer) {
    return ''
  }
  singer.forEach((item) => {
    ret.push(item.name)
  })
  return ret.join('/')
}
