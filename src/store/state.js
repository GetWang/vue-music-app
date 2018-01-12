import { playMode } from 'common/js/config'

const state = {
  singer: {},               // 单个歌手数据
  playing: false,           // 播放状态（播放、暂停）
  fullScreen: false,        // 播放器是否全屏
  playlist: [],             // 播放器的当前播放列表，该列表会根据播放模式进行调整歌曲的顺序
  sequenceList: [],         // 播放器的顺序播放列表
  mode: playMode.sequence,  // 播放器的模式，默认为顺序播放
  currentIndex: -1          // 播放器当前播放的歌曲的索引
}

export default state
