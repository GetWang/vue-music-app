export default class Song {
  constructor({ id, name, singer, mid, album, duration, image, url }) {
    this.id = id
    this.name = name
    this.singer = singer
    this.mid = mid
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
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
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: `http://ws.stream.qqmusic.qq.com/${musicData.songid}.m4a?fromtag=46`
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
