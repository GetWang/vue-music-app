import { mapGetters } from 'vuex'

/* 定义一个处理mini播放器与多个页面底部适配的问题，即使得页面的底部不会被mini播放器遮住内容 */
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
