import storage from 'good-storage'

const SEARCH_KEY = '__search__'       // 本地存储中搜索历史的key
const SEARCH_MAX_LEN = 15             // 本地存储中搜索历史数据最大的个数
const PLAY_KEY = '__play__'           // 本地存储中播放历史的key
const PLAY_MAX_LEN = 100              // 本地存储中播放历史数据最大的个数
const FAVORITE_KEY = '__favorite__'   // 本地存储中收藏列表的key
const FAVORITE_MAX_LEN = 100          // 本地存储中收藏列表歌曲的最大个数

/* 定义一个将数据插入数组中的方法（会查找数组中是否有该数据，可以限制数组的最大长度） */
function insertToArray(arr, val, compare, maxLen) {
  let index = arr.findIndex(compare)
  // 如果数组中有该数据，且在数组的第一个，则不做插入操作
  if (index === 0) {
    return
  } else if (index > 0) {
    arr.splice(index, 1)
  }
  // 将数据插入到数组的第一个位置
  arr.unshift(val)
  // 若限制了数组的最大长度，且数组的当前长度超过maxLen，则删除数组的最后一个元素
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}

/* 从数组中删除某个数据 */
function deleteFromArray(arr, compare) {
  let index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

/* 定义一个保存搜索词到搜索历史中的方法 */
export function saveSearch(query) {
  // 先取出本地存储中搜索历史数据
  let searches = storage.get(SEARCH_KEY, [])
  insertToArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LEN)
  // 将新的搜索词保存到本地存储的搜索历史中
  storage.set(SEARCH_KEY, searches)
  return searches
}

/* 定义一个加载本地存储的搜索历史到store中的searchHistory状态的方法 */
export function loadSearch() {
  return storage.get(SEARCH_KEY, [])
}

/* 定义一个删除本地存储中的某条搜索历史数据的方法 */
export function deleteSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}

/* 定义一个清空本地存储中的搜索历史数据的方法 */
export function clearSearch() {
  storage.remove(SEARCH_KEY)
  return []
}

/* 定义一个保存播放歌曲到播放历史中的方法 */
export function savePlay(song) {
  let songs = storage.get(PLAY_KEY, [])
  insertToArray(songs, song, (item) => {
    return item.id === song.id
  }, PLAY_MAX_LEN)
  storage.set(PLAY_KEY, songs)
  return songs
}

/* 定义一个加载本地存储的播放历史到store中的playHistory状态的方法 */
export function loadPlay() {
  return storage.get(PLAY_KEY, [])
}

/* 定义一个保存喜欢的歌曲到歌曲收藏列表中的方法 */
export function saveFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, [])
  insertToArray(songs, song, (item) => {
    return item.id === song.id
  }, FAVORITE_MAX_LEN)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

/* 定义一个删除本地存储中的某首喜欢歌曲的方法 */
export function deleteFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return item.id === song.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

/* 定义一个加载本地存储的歌曲收藏列表到store中的favoriteList状态的方法 */
export function loadFavorite() {
  return storage.get(FAVORITE_KEY, [])
}
