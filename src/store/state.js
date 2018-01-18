import { playMode } from 'common/js/config'
import { loadSearch } from 'common/js/cache'

const state = {
  singer: {},               // 当前歌手数据
  playing: false,           // 播放状态（播放、暂停）
  fullScreen: false,        // 播放器是否全屏
  playlist: [],             // 播放器的当前播放列表，该列表会根据播放模式进行调整歌曲的顺序
  sequenceList: [],         // 播放器的顺序播放列表
  mode: playMode.sequence,  // 播放器的模式，默认为顺序播放
  currentIndex: -1,         // 播放器当前播放的歌曲的索引
  disc: {},                 // 当前歌单数据
  topList: {},              // 当前排行榜数据(非详情数据)
  searchHistory: loadSearch(),        // 当前的搜索历史（初始值从本地存储的搜索历史中读取）
  playHistory: []                     // 当前的播放历史（初始值从本地存储的播放历史读取）
}

export default state
