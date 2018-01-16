import storage from 'good-storage'

const SEARCH_KEY = '__search__'       // 本地存储中搜索历史的key
const SEARCH_MAX_LEN = 15             // 本地存储中搜索历史数据最大的个数

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

/* 定义一个加载本地存储的搜索历史到store中的saveSearchHistory状态的方法 */
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
