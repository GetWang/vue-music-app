<template>
  <div class="player" v-show="playlist.length > 0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave">
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
            <div class="cd-wrapper" ref="cdWrapper">
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
    </transition>
    <transition name="mini">
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
    </transition>

  </div>
</template>

<script type="text/ecmascript-6">
  import animations from 'create-keyframe-animation'
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
      }),
      /* 以下是使用Vue过渡动画提供的JavaScript钩子写出的函数，
       * enter钩子函数定义并运行进入时cdWrapper元素的动画，并触发after-enter钩子 */
      enter(el, done) {
        let { x, y, scale } = this._getPosAndScale()
        /* 定义一个展开播放器的动画对象，该对象供上面导入的三方JS动画库使用 */
        let animation = {
          /* 0%时，mini播放器歌手图片中心点参考全屏播放器歌手图片中心点的transform */
          0: {
            transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
          },
          /* 60%时，mini播放器歌手图片中心点参考全屏播放器歌手图片中心点的transform */
          60: {
            transform: `translate3d(0, 0, 0) scale(1.1)`
          },
          /* 100%时，mini播放器歌手图片中心点参考全屏播放器歌手图片中心点的transform */
          100: {
            transform: `translate3d(0, 0, 0) scale(1)`
          }
        }
        /* 使用三方JS动画库注册一个动画 */
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })
        /* 运行注册的动画，该方法的第一个参数是动画所要作用的DOM元素，第三个参数是动画结束后执行的回调函数 */
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      /* afterEnter钩子函数注销之前注册的动画并清除cdWrapper元素上设置的行内动画样式 */
      afterEnter() {
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      /* leave钩子函数设置cdWrapper元素离开时的过渡动画，并在结束动画后触发after-leave钩子 */
      leave(el, done) {
        this.$refs.cdWrapper.style.transition = `all 0.4s`
        const { x, y, scale } = this._getPosAndScale()
        this.$refs.cdWrapper.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      /* afterEnter钩子函数清除cdWrapper元素上设置的行内过渡样式 */
      afterLeave() {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style.transform = ''
      },
      /* 获取全屏播放器和mini播放器初始X轴和Y轴的偏移量（以全屏播放器歌手图片的中心点为参考点）、
       * 大小比例scale（参考全屏播放器歌手图片的大小） */
      _getPosAndScale() {
        const targetWidth = 40                      // mini播放器歌手图片的宽度
        const paddingLeft = 40                      // mini播放器歌手图片中心点距离屏幕左侧的宽度
        const paddingBottom = 30                    // mini播放器歌手图片中心点距离屏幕下侧的高度
        const paddingTop = 80                       // 全屏播放器歌手图片上边缘距离屏幕上侧的高度
        const width = window.innerWidth * 0.8       // 全屏播放器歌手图片的宽度（高度同宽度）
        const scale = targetWidth / width           // mini播放器歌手图片与全屏播放器歌手图片的比例
        /* 全屏播放器歌手图片中心点X轴方向与mini播放器歌手图片中心点X轴方向的偏移量 */
        const x = -(window.innerWidth / 2 - paddingLeft)
        /* 全屏播放器歌手图片中心点Y轴方向与mini播放器歌手图片中心点Y轴方向的偏移量 */
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
        return {
          x,
          y,
          scale
        }
      }
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
      &.normal-enter-active, &.normal.leave-active
        transition: all 0.4s
        /* 顶部和底部的滑入动画使用了贝塞尔曲线 */
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
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
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
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
