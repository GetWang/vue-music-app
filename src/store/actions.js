import * as types from './mutation-types'

/* 当点击歌曲列表的歌曲时，提交多个mutation。函数的第二个参数是mutation的载荷payload */
export const selectPlay = function ({ commit, state }, { list, index }) {
  commit(types.SET_PLAYLIST, list)
  commit(types.SET_SEQUENCE_LIST, list)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_PLAYING_STATE, true)
}
