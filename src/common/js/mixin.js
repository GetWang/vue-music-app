import { mapGetters, mapMutations, mapActions } from 'vuex'
import { shuffle } from 'common/js/util'
import { playMode } from 'common/js/config'

/* 定义一个处理mini播放器与多个页面底部适配问题的混合，即使得页面的底部不会被mini播放器遮住内容 */
export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  mounted() {
    this.handlePlaylist(this.playlist)
  },
  activated() {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist(newVal) {
      this.handlePlaylist(this.playlist)
    }
  },
  methods: {
    /* 该方法会在使用了该混合对象而没有定义一个handlePlaylist方法时，
       在以上调用了该方法的钩子中执行，即抛出一个错误，目的是提醒开发者
       须在相应的组件中定义一个同名方法以覆盖本混合对象的方法，具体解决
       逻辑由相应组件去完成，这里只负责将播放列表playlist数据传出。 */
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method')
    }
  }
}

/* 定义一个共享全屏播放器和歌曲播放列表播放模式切换功能的混合 */
export const playerMixin = {
  computed: {
    /* 设置播放模式的的图标 */
    iconMode() {
      return this.mode === playMode.sequence ? 'icon-sequence' : (this.mode === playMode.loop ? 'icon-loop' : 'icon-random')
    },
    ...mapGetters([
      'playlist',
      'currentSong',
      'sequenceList',
      'mode',
      'favoriteList'
    ])
  },
  methods: {
    /* 每点击播放模式图标时，改变一次模式，并相应地修改当前播放列表 */
    changeMode() {
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode)
      let list = null
      /* 当播放模式改为随机播放模式时，修改当前播放列表为随机播放列表，否则修改为顺序播放列表 */
      if (mode === playMode.random) {
        list = shuffle(this.playlist)
      } else {
        list = this.sequenceList
      }
      this.resetCurrentIndex(list)
      this.setPlayList(list)
    },
    /* 当播放模式改为随机播放模式时，在随机播放列表中找到当前播放歌曲的索引，然后重置当前的歌曲索引，以保证当前播放歌曲不变 */
    resetCurrentIndex(list) {
      // findIndex方法是ES6中的数组方法
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    /* 获取当前播放歌曲喜欢/不喜欢的图标 */
    getFavoriteIcon(song) {
      if (this.isFavorite(song)) {
        return 'icon-favorite'
      }
      return 'icon-not-favorite'
    },
    /* 将当前播放歌曲切换为喜欢/不喜欢 */
    toggleFavorite(song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteList(song)
      } else {
        this.saveFavoriteList(song)
      }
    },
    /* 判断当前播放歌曲收藏与否 */
    isFavorite(song) {
      const index = this.favoriteList.findIndex((item) => {
        return item.id === song.id
      })
      return index > -1
    },
    ...mapMutations({
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayingState: 'SET_PLAYING_STATE'
    }),
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  }
}

/* 定义一个共享搜索页面和添加歌曲组件的一些相同的业务逻辑的混合 */
export const searchMixin = {
  data() {
    return {
      query: '',
      /* 当scroll组件data接口数据发生变化时延时刷新scroll组件的延时时间（因为scroll组件内使用了列表过渡） */
      refreshDelay: 120
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    onQueryChange(query) {
      this.query = query
    },
    /* 点击热门搜索词或搜索历史后，设置搜索框的query */
    addQuery(query) {
      this.$refs.searchBox.setQuery(query)
    },
    /* 搜索结果列表将要滚动时，让输入框失去焦点 */
    blurInput() {
      this.$refs.searchBox.blur()
    },
    /* 保存搜索词 */
    saveSearch() {
      this.saveSearchHistory(this.query)
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
}
