<template>
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="hide">
      <div class="list-wrapper" @click.stop>
        <div class="list-header">
          <h1 class="title">
            <i class="icon"></i>
            <span class="text"></span>
            <span class="clear" @click="showConfirm">
              <i class="icon-clear"></i>
            </span>
          </h1>
        </div>
        <scroll ref="listContent" class="list-content" :data="sequenceList">
          <transition-group name="list" tag="ul">
            <li :key="item.id" ref="listItem" class="item" v-for="(item, index) in sequenceList" @click="selectItem(item, index)">
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text">{{ item.name }}</span>
              <span class="like">
                <i class="icon-favorite"></i>
              </span>
              <span class="delete" @click.stop="deleteOne(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate">
          <div class="add">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div class="list-close" @click="hide">
          <span>关闭</span>
        </div>
      </div>
      <confirm ref="confirm" title="是否清空播放列表" @confirm="confirmClear"></confirm>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import Confirm from 'base/confirm/confirm'
  import { mapGetters, mapMutations, mapActions } from 'vuex'
  import { playMode } from 'common/js/config'

  export default {
    data() {
      return {
        showFlag: false
      }
    },
    computed: {
      ...mapGetters([
        'sequenceList',
        'playlist',
        'currentSong',
        'mode'
      ])
    },
    watch: {
      /* 当前播放歌曲发生变化且歌曲播放列表显示时，滚动到当前播放歌曲 */
      currentSong(newSong, oldSong) {
        if (!this.showFlag || newSong.id === oldSong.id) {
          return
        }
        this.scrollToCurrent(newSong)
      }
    },
    methods: {
      show() {
        this.showFlag = true
        // 需当DOM渲染完毕后手动刷新scroll组件
        setTimeout(() => {
          this.$refs.listContent.refresh()
          // 歌曲列表渲染完显示时，滚动到当前播放歌曲
          this.scrollToCurrent(this.currentSong)
        }, 20)
      },
      hide() {
        this.showFlag = false
      },
      /* 对列表中当前播放的歌曲添加当前播放样式 */
      getCurrentIcon(item) {
        if (item.id === this.currentSong.id) {
          return 'icon-play'
        }
        return ''
      },
      /* 选择播放列表中的某首歌曲进行播放 */
      selectItem(song, index) {
        if (this.mode === playMode.random) {
          index = this.playlist.findIndex((item) => {
            return item.id === song.id
          })
        }
        this.setCurrentIndex(index)
        this.setPlayingState(true)
      },
      /* 从播放列表中删除一首歌曲 */
      deleteOne(song) {
        this.deleteSong(song)
        // 若删除了列表中的最后一首歌曲，则隐藏歌曲列表
        if (!this.playlist.length) {
          this.hide()
        }
      },
      /* 弹出确认窗口 */
      showConfirm() {
        this.$refs.confirm.show()
      },
      /* 清空播放列表并隐藏歌曲列表 */
      confirmClear() {
        this.clearSongList()
        this.hide()
      },
      /* 在歌曲播放列表中滚动到当前播放歌曲，并设置300ms动画 */
      scrollToCurrent(current) {
        const index = this.sequenceList.findIndex((item) => {
          return item.id === current.id
        })
        this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300)
      },
      ...mapMutations({
        setCurrentIndex: 'SET_CURRENT_INDEX',
        setPlayingState: 'SET_PLAYING_STATE'
      }),
      ...mapActions([
        'deleteSong',
        'clearSongList'
      ])
    },
    components: {
      Scroll,
      Confirm
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import '~common/stylus/variable'
  @import '~common/stylus/mixin'

  .playlist
    position: fixed
    top: 0
    left: 0
    bottom: 0
    right: 0
    z-index: 200
    background: $color-background-d
    &.list-fade-enter-active, &.list-fade-leave-active
      transition: opacity 0.3s
    &.list-fade-enter, &.list-fade-leave-to
      opacity: 0
      .list-wrapper
        transform: translate3d(0, 100%, 0)
    .list-wrapper
      position: absolute
      bottom: 0
      left: 0
      width: 100%
      background-color: $color-highlight-background
      .list-header
        position: relative
        padding: 20px 30px 10px 20px
        .title
          display: flex
          align-items: center
          .icon
            margin-right: 10px
            font-size: 30px
            color: $color-theme-d
          .text
            flex: 1
            font-size: $font-size-medium
            color: $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
      .list-content
        max-height: 240px
        overflow: hidden
        .item
          display: flex
          align-items: center
          height: 40px
          padding: 0 30px 0 20px
          overflow: hidden
          /* 列表的过渡动画 */
          &.list-enter-active, &.list-leave-active
            transition: all 0.1s
          &.list-enter, &.list-leave-to
            height: 0
          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-theme-d
          .text
            flex: 1
            no-wrap()
            font-size: $font-size-medium
            color: $color-text-d
          .like
            margin-right: 15px
            extend-click()
            font-size: $font-size-small
            color: $color-theme
            .icon-favorite
              color: $color-sub-theme
          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme
      .list-operate
        width: 140px
        margin: 20px auto 30px auto
        .add
          display: flex
          align-items: center
          padding: 8px 16px
          border: 1px solid $color-text-l
          border-radius: 100px
          color: $color-text-l
          .icon-add
            margin-right: 5px
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
      .list-close
        text-align: center
        font-size: $font-size-medium-x
        line-height: 50px
        color: $color-text-l
        background: $color-background
</style>
