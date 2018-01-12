import * as types from './mutation-types'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'

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

export function randomPlay({ commit, state }, { list }) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  commit(types.SET_PLAYING_STATE, true)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_CURRENT_INDEX, 0)
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
}
