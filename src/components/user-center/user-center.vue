<template>
  <transition name="slide">
    <div class="user-center">
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <div class="switches-wrapper">
        <switches :switches="switches" @switch="switchItem" :currentIndex="currentIndex"></switches>
      </div>
      <div class="playBtn" @click="random">
        <i class="icon-play"></i>
        <span class="text">随机播放</span>
      </div>
      <div class="list-wrapper" ref="listWrapper">
        <scroll ref="favoriteList" class="list-scroll" v-if="currentIndex === 0" :data="favoriteList">
          <div class="list-inner">
            <song-list :songs="favoriteList" @select="selectSong"></song-list>
          </div>
        </scroll>
        <scroll ref="playHistory" class="list-scroll" v-if="currentIndex === 1" :data="playHistory">
          <div class="list-inner">
            <song-list :songs="playHistory" @select="selectSong"></song-list>
          </div>
        </scroll>
      </div>
      <div class="no-result-wrapper" v-show="noResult">
        <no-result :title="noResultDesc"></no-result>
      </div>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import Switches from 'base/switches/switches'
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list'
  import NoResult from 'base/no-result/no-result'
  import { mapGetters, mapActions } from 'vuex'
  import Song from 'common/js/song'
  import { playlistMixin } from 'common/js/mixin'

  export default {
    data() {
      return {
        currentIndex: 0,
        switches: [
          {
            name: '我喜欢的'
          },
          {
            name: '最近听的'
          }
        ]
      }
    },
    computed: {
      /* 根据当前列表是否为空来设置no-result是否显示 */
      noResult() {
        if (this.currentIndex === 0) {
          return !this.favoriteList.length
        } else {
          return !this.playHistory.length
        }
      },
      /* 根据当前列表来设置相应的无结果的描述文字 */
      noResultDesc() {
        if (this.currentIndex === 0) {
          return '暂无收藏歌曲'
        } else {
          return '你还没有听过歌曲'
        }
      },
      ...mapGetters([
        'favoriteList',
        'playHistory'
      ])
    },
    mixins: [playlistMixin],
    methods: {
      switchItem(index) {
        this.currentIndex = index
      },
      back() {
        this.$router.back()
      },
      /* 这里使用mixin根据播放器的播放列表解决用户中心页面底部与mini播放器不适配的问题 */
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.listWrapper.style.bottom = bottom
        this.$refs.favoriteList && this.$refs.favoriteList.refresh()
        this.$refs.playHistory && this.$refs.playHistory.refresh()
      },
      /* 点击随机播放时，根据当前tab随机播放相应歌曲列表 */
      random() {
        let list = this.currentIndex === 0 ? this.favoriteList : this.playHistory
        if (list.length === 0) {
          return
        }
        list = list.map((song) => {
          return new Song(song)
        })
        this.randomPlay({ list })
      },
      /* 向播放列表插入选择的歌曲并全屏播放 */
      selectSong(song) {
        this.insertSong(new Song(song))
      },
      ...mapActions([
        'insertSong',
        'randomPlay'
      ])
    },
    components: {
      Switches,
      Scroll,
      SongList,
      NoResult
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import '~common/stylus/variable'

  .user-center
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 100
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .back
      position: absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .switches-wrapper
      margin: 10px 0 30px
    .playBtn
      width: 135px
      margin: 0 auto
      padding: 7px 0
      box-sizing: border-box
      text-align: center
      border: 1px solid $color-text-l
      border-radius: 100px
      font-size: 0
      color: $color-text-l
      .icon-play
        display: inline-block
        margin-right: 6px
        vertical-align: middle
        font-size: $font-size-small
      .text
        display: inline-block
        vertical-align: middle
        font-size: $font-size-small
    .list-wrapper
      position: absolute
      top: 110px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner
          padding: 20px 30px
    .no-result-wrapper
      position: absolute
      top: 50%
      left: 0
      width: 100%
      transform: translateY(-50%)
      1
</style>
