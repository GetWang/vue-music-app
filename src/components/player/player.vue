<template>
  <div class="player" v-show="playlist.length > 0">
    <div class="normal-player" v-show="fullScreen">
      <div class="background">
        <img :src="currentSong.image" width="100%" height="100%">
      </div>
      <div class="top">
        <div class="back" @click="back">
          <i class="icon-back"></i>
        </div>
        <h1 class="title" v-html="currentSong.name"></h1>
        <h2 class="subtitle" v-html="currentSong.singer"></h2>
      </div>
      <div class="middle">
        <div class="middle-l">
          <div class="cd-wrapper">
            <div class="cd">
              <img class="image" :src="currentSong.image">
            </div>
          </div>
        </div>
      </div>
      <div class="bottom">
        <div class="operators">
          <div class="icon i-left">
            <i class="icon-sequence"></i>
          </div>
          <div class="icon i-left">
            <i class="icon-prev"></i>
          </div>
          <div class="icon i-center">
            <i class="icon-play"></i>
          </div>
          <div class="icon i-right">
            <i class="icon-next"></i>
          </div>
          <div class="icon i-right">
            <i class="icon-not-favorite"></i>
          </div>
        </div>
      </div>
    </div>
    <div class="mini-player" v-show="!fullScreen" @click="open">
      <div class="icon">
        <img :src="currentSong.image" width="40" height="40">
      </div>
      <div class="text">
        <h2 class="name" v-html="currentSong.name"></h2>
        <p class="desc" v-html="currentSong.singer"></p>
      </div>
      <div class="control">
        <i class="icon-play-mini"></i>
      </div>
      <div class="control">
        <i class="icon-playlist"></i>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import { mapGetters, mapMutations } from 'vuex'

  export default {
    computed: {
      ...mapGetters([
        'fullScreen',
        'playlist',
        'currentSong'
      ])
    },
    methods: {
      /* 切换至mini播放器 */
      back() {
        this.setFullScreen(false)
      },
      /* 切换至全屏播放器 */
      open() {
        this.setFullScreen(true)
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN'
      })
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import '~common/stylus/variable'
  @import '~common/stylus/mixin'

  .player
    .normal-player
      position: fixed
      top: 0
      right: 0
      bottom: 0
      left: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        top: 0
        left: 0
        z-index: -1
        opacity: 0.6          // 使得背景图片有一点透明的效果
        filter: blur(20px)    // 使得背景图片有高斯模糊的效果
      .top
        position: relative
        margin-bottom: 25px
        .back
          position: absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            transform: rotate(-90deg)     // 将返回图标逆时针旋转90度
            font-size: $font-size-large-x
            color: $color-theme
        .title
          width: 70%
          margin: 0 auto
          text-align: center
          no-wrap()
          font-size: $font-size-large
          line-height: 40px
          color: $color-text
        .subtitle
          text-align: center
          font-size: $font-size-medium
          line-height: 20px
          color: $color-text
      .middle
        position: fixed
        top: 80px
        bottom: 170px
        width: 100%
        white-space: nowrap
        font-size: 0
        .middle-l
          position: relative
          display: inline-block
          width: 100%
          height: 0
          /* 高度设置为浏览器视口宽度的80%，达到该div宽高比始终为10:8的效果 */
          padding-top: 80%
          vertical-align: top
          /* 根据上面宽高比10:8和以下的一些样式设置，使得旋转的歌手图片始终为正方形 */
          .cd-wrapper
            position: absolute
            top: 0
            left: 10%
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              .image
                position: absolute
                top: 0
                left: 0
                width: 100%
                height: 100%
                border-radius: 50%
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
    .mini-player
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      display: flex
      align-items: center
      width: 100%
      height: 60px
      background: $color-highlight-background
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
      .text
        display: flex
        flex: 1
        flex-direction: column
        justify-content: center
        overflow: hidden
        line-height: 20px
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
</style>
