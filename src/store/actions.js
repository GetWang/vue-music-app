import * as types from './mutation-types'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'
import { saveSearch, deleteSearch, clearSearch } from 'common/js/cache'

/* 在数组中查找给定歌曲实例的索引 */
function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

/* 当点击歌曲列表的歌曲时，提交多个mutation，选择播放歌曲。函数的第二个参数是mutation的载荷payload */
export const selectPlay = function ({ commit, state }, { list, index }) {
  commit(types.SET_SEQUENCE_LIST, list)
  /* 若当前播放模式为随机播放，在歌手详情页选择一首歌曲播放，则将这首歌曲也加入随机播放列表，依旧是随机播放 */
  if (state.mode === playMode.random) {
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_PLAYING_STATE, true)
}

/* 当点击随机播放全部按钮或切换到随机播放模式时，提交多个mutation，将当前播放列表歌曲顺序打乱 */
export function randomPlay({ commit }, { list }) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  commit(types.SET_PLAYING_STATE, true)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_CURRENT_INDEX, 0)
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
}

/* 提交多个mutation，向播放器的播放列表插入一首歌曲，并播放该首歌曲。
   这里只向当前播放列表插入一首歌曲，播放模式还是使用原来的模式，不做修改 */
export function insertSong({ commit, state }, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  // 先记录一下当前歌曲
  let currentSong = playlist[currentIndex]
  // 查找当前播放列表中是否有将被插入的歌曲
  let fpIndex = findIndex(playlist, song)
  // 因为是插入歌曲，所以索引加1
  currentIndex++
  // 将要插入的歌曲插入到currentIndex位置
  playlist.splice(currentIndex, 0, song)
  /* 若当前播放列表中有这首将被插入的歌曲，则先判断
     当前列表中的歌曲是在插入的歌曲的前面还是后面 */
  if (fpIndex > -1) {
    /* 若当前列表中的歌曲是在插入的歌曲的前面，直接删除当前列表中
       的歌曲，currentIndex减1；否则直接删除当前列表中的歌曲 */
    if (fpIndex < currentIndex) {
      playlist.splice(fpIndex, 1)
      currentIndex--
    } else {
      playlist.splice(fpIndex + 1, 1)
    }
  }
  /* 以下一小段代码将歌曲插入顺序播放列表，并判断顺序
     播放列表中是否有将被插入的歌曲，若有就直接删除 */
  let currentSIndex = findIndex(sequenceList, currentSong) + 1
  let fsIndex = findIndex(sequenceList, song)
  sequenceList.splice(currentSIndex, 0, song)
  if (fsIndex > -1) {
    if (fsIndex < currentSIndex) {
      sequenceList.splice(fsIndex, 1)
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_PLAYING_STATE, true)
  commit(types.SET_FULL_SCREEN, true)
}

/* 提交多个mutation，从播放器的播放列表删除一首歌曲。 */
export function deleteSong({ commit, state }, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  let pIndex = findIndex(playlist, song)
  playlist.splice(pIndex, 1)
  /* 当要删除的歌曲在当前播放歌曲的前面或要删除的歌曲就是当前
     播放的歌曲且是列表中的最后一首时，currentIndex减一 */
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex--
  }
  let sIndex = findIndex(sequenceList, song)
  sequenceList.splice(sIndex, 1)
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  // 当播放列表中的歌曲均被删除完时，将播放状态设为暂停，否则设为播放中
  const playingState = playlist.length > 0
  commit(types.SET_PLAYING_STATE, playingState)
}

/* 提交多个mutation，清空播放列表 */
export function clearSongList({ commit }) {
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYING_STATE, false)
}

/* 将搜索词添加到搜索历史中，并提交一个修改store中searchHistory的mutation */
export function saveSearchHistory({ commit }, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

/* 将某个搜索词从搜索历史中删除，并提交一个修改store中searchHistory的mutation */
export function deleteSearchHistory({ commit }, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

/* 将搜索历史清空，并提交一个修改store中searchHistory的mutation */
export function clearSearchHistory({ commit }) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}
