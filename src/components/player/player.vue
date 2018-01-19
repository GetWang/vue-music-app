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
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div :class="cdCls" class="cd">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{ playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine" class="text"
                   :class="{ current: currentLineNum === index }"
                   v-for="(line, index) in currentLyric.lines">{{ line.txt }}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{ active: currentShow === 'cd' }"></span>
            <span class="dot" :class="{ active: currentShow === 'lyric' }"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{ formatTime(currentTime) }}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressChange"></progress-bar>
            </div>
            <span class="time time-r">{{ formatTime(currentSong.duration) }}</span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i :class="iconMode" @click="changeMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :class="cdCls" :src="currentSong.image" width="40" height="40">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i @click.stop="togglePlaying" :class="playMiniIcon" class="icon-mini"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <audio ref="audio" :src="currentSong.url" @canplay="ready"
           @error="error" @timeupdate="updateTime" @ended="end"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
  import ProgressBar from 'base/progress-bar/progress-bar'
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import Scroll from 'base/scroll/scroll'
  import Playlist from 'components/playlist/playlist'
  import animations from 'create-keyframe-animation'
  import Lyric from 'lyric-parser'
  import { mapGetters, mapMutations, mapActions } from 'vuex'
  import { prefixStyle } from 'common/js/dom'
  import { playMode } from 'common/js/config'
  import { playerMixin } from 'common/js/mixin'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')

  export default {
    data() {
      return {
        songReady: false,     // 当前歌曲是否准备好的标志位
        currentTime: 0,       // 当前歌曲播放的时间戳（未格式化）
        radius: 32,           // 圆形进度条组件圆的半径
        currentLyric: null,   // 当前歌曲的歌词对象
        currentLineNum: 0,    // 当前歌曲正在播放的歌词行数
        currentShow: 'cd',    // 当前显示的是歌词列表还是cd
        playingLyric: ''      // 当前播放的某句歌词
      }
    },
    created() {
      this.touch = {}         // 在播放器的中部触摸屏幕时存放跟touch相关的数据
    },
    /* 使用了跟播放模式相关的混合，即和歌曲播放列表组件共用了播放模式相关的逻辑 */
    mixins: [playerMixin],
    computed: {
      /* 设置全屏播放器播放、暂停的图标 */
      playIcon() {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      /* 设置mini播放器播放、暂停的图标 */
      playMiniIcon() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      /* 控制全屏播放器和mini播放器的歌手图片的旋转 */
      cdCls() {
        return this.playing ? 'play' : 'play pause'
      },
      /* 若歌曲未准备好，则将播放、上一首、下一首按钮的图标颜色设置为灰色，以在视觉上体现歌曲未准备好 */
      disableCls() {
        return this.songReady ? '' : 'disable'
      },
      /* 计算歌曲当前播放时间点占歌曲时长的百分比 */
      percent() {
        return this.currentTime / this.currentSong.duration
      },
      ...mapGetters([
        'fullScreen',
        'playing',
        'currentIndex'
      ])
    },
    watch: {
      /* 歌曲切换后，自动播放 */
      currentSong(newSong, oldSong) {
        // 当歌曲列表中没有歌曲时，不做任何操作
        if (!newSong.id) {
          return
        }
        /* 修复当歌曲暂停播放时，切换到随机播放模式或顺序播放模式，歌曲开始播放的bug */
        if (newSong.id === oldSong.id) {
          return
        }
        /* 当前歌曲发生改变后，若歌词对象存在，就停止它启动的计时，防止歌词播放错乱，并做一些清空操作 */
        if (this.currentLyric) {
          this.currentLyric.stop()
          this.currentTime = 0
          this.playingLyric = ''
          this.currentLineNum = 0
        }
        this.$nextTick(() => {
          this.$refs.audio.play()
          this.getLyric()
        })
      },
      /* 播放状态发生变化后，控制歌曲的播放、暂停 */
      playing(newPlaying) {
        const audio = this.$refs.audio
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      }
    },
    methods: {
      /* 显示歌曲播放列表 */
      showPlaylist() {
        this.$refs.playlist.show()
      },
      /* 切换至mini播放器 */
      back() {
        this.setFullScreen(false)
      },
      /* 切换至全屏播放器 */
      open() {
        this.setFullScreen(true)
      },
      /* 切换播放、暂停状态 */
      togglePlaying() {
        this.setPlayingState(!this.playing)
        // 若当前歌曲对象存在，切换歌词的播放状态
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      /* 播放下一首歌 */
      next() {
        // 如果当前歌曲还没准备好，不允许切换下一首
        if (!this.songReady) {
          return
        }
        /* 考虑播放列表的边界情况，即播放列表中只有一首歌曲 */
        if (this.playlist.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex + 1
          if (index === this.playlist.length) {
            index = 0
          }
          this.setCurrentIndex(index)
        }
        // 若歌曲暂停播放时切换下一首，需修改播放状态为播放中
        if (!this.playing) {
          this.setPlayingState(true)
        }
        this.songReady = false
      },
      /* 播放上一首歌 */
      prev() {
        // 如果当前歌曲还没准备好，不允许切换上一首
        if (!this.songReady) {
          return
        }
        if (this.playlist.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex - 1
          if (index === -1) {
            index = this.playlist.length - 1
          }
          this.setCurrentIndex(index)
        }
        // 若歌曲暂停播放时切换上一首，需修改播放状态为播放中
        if (!this.playing) {
          this.setPlayingState(true)
        }
        this.songReady = false
      },
      /* 单曲循环 */
      loop() {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        // 若当前歌词对象存在，从头开始播放歌词
        if (this.currentLyric) {
          this.currentLyric.seek(0)
        }
      },
      /* 歌曲准备好时，将songReady标志位设为true；同时将该歌曲保存到播放历史 */
      ready() {
        this.songReady = true
        this.savePlayHistory(this.currentSong)
      },
      /* 当请求的歌曲url错误或网络异常，也将songReady标志位设为true，不然就无法切换上、下首歌曲 */
      error() {
        this.songReady = true
      },
      /* 当歌曲播放完毕时，执行该函数 */
      end() {
        if (this.mode === playMode.loop) {
          this.loop()
        } else {
          this.next()
        }
      },
      /* 更新歌曲当前播放的时间点 */
      updateTime(e) {
        this.currentTime = e.target.currentTime
      },
      onProgressChange(percent) {
        const currentTime = this.currentSong.duration * percent
        this.$refs.audio.currentTime = currentTime
        if (!this.playing) {
          this.togglePlaying()
        }
        // 若当前歌词对象存在，将歌词的播放进度定位到当前歌曲的播放进度
        if (this.currentLyric) {
          this.currentLyric.seek(currentTime * 1000)
        }
      },
      /* 格式化获取到的歌曲当前播放时间戳，显示为我们想要的时间格式 */
      formatTime(interval) {
        // 下面这条语句将interval向下取整，相当于Math.floor(interval)
        interval = interval | 0
        const minute = interval / 60 | 0
        const second = this._padTime(interval % 60)
        return `${minute}:${second}`
      },
      /* 获取当前歌曲的歌词，并创建一个歌词对象 */
      getLyric() {
        this.currentSong.getLyric().then((lyric) => {
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          /* 如果当前正在播放歌曲，就使用三方库的play方法去播放歌词，即每到一个时间，执行一次传入的回调函数 */
          if (this.playing) {
            this.currentLyric.play()
          }
        }).catch(() => {            // 歌词获取失败时，做一些清理操作
          this.currentLyric = null
          this.currentLineNum = 0
          this.playingLyric = ''
        })
      },
      /* 歌曲每到有歌词的时间点时，所要执行的传入的回调函数 */
      handleLyric({ lineNum, txt }) {
        this.currentLineNum = lineNum
        /* 如果当前歌词的行数大于6，则将该行歌词滚动到歌词列表中间，否则滚动到歌词列表顶部，这里滚动都加了1000ms的过渡动画 */
        if (lineNum > 6) {
          let lineEle = this.$refs.lyricLine[lineNum - 6]
          this.$refs.lyricList.scrollToElement(lineEle, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        this.playingLyric = txt
      },
      /* 播放器中部上的touchstart事件处理函数 */
      middleTouchStart(e) {
        this.touch.initialed = true   // 播放器中部发生touchstart事件的标志位
        const touch = e.touches[0]
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
      },
      /* 播放器中部上的touchmove事件处理函数 */
      middleTouchMove(e) {
        if (!this.touch.initialed) {
          return
        }
        const touch = e.touches[0]
        const deltaX = touch.pageX - this.touch.startX
        const deltaY = touch.pageY - this.touch.startY
        /* 因为播放器中部有歌词列表且它能够在Y轴方向上滚动，
           所以在中部滚动时，若垂直滚动的距离大于水平滚动的距离，就忽略水平滚动 */
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          // 自己修复一个滚动歌词时，会自动滑到CD界面的bug
          this.touch.percent = undefined
          return
        }
        // left表示歌词列表左边缘相对于屏幕右边缘的距离
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        // offsetWidth表示左右滑动时歌词列表的偏移量，并限制最大和最小的偏移量
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        // 左右滑动距离占屏幕宽度的百分比
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.lyricList.$el.style[transitionDuration] = 0
        // 左右滑动时，cd封面的透明度随着滑动的百分比的增大而增大
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
        this.$refs.middleL.style[transitionDuration] = 0
      },
      /* 播放器中部上的touchend事件处理函数 */
      middleTouchEnd() {
        this.touch.initialed = false
        let offsetWidth
        const time = 300    // 过渡时间
        let opacity         // cd封面的不透明度
        /* 根据左右滑动的百分比判断是否要切换界面，并得出切换到哪个界面 */
        if (this.currentShow === 'cd') {
          if (this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth
            opacity = 0
            this.currentShow = 'lyric'
          } else {
            offsetWidth = 0
            opacity = 1
          }
        } else {
          if (this.touch.percent < 0.9) {
            offsetWidth = 0
            opacity = 1
            this.currentShow = 'cd'
          } else {
            offsetWidth = -window.innerWidth
            opacity = 0
          }
        }
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = `${time}ms`
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
            [transform]: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
          },
          /* 60%时，mini播放器歌手图片中心点参考全屏播放器歌手图片中心点的transform */
          60: {
            [transform]: `translate3d(0, 0, 0) scale(1.1)`
          },
          /* 100%时，mini播放器歌手图片中心点参考全屏播放器歌手图片中心点的transform */
          100: {
            [transform]: `translate3d(0, 0, 0) scale(1)`
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
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      /* afterEnter钩子函数清除cdWrapper元素上设置的行内过渡样式 */
      afterLeave() {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
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
      },
      /* 为当前播放的时间点的秒部分做补零操作，默认秒部分为两位 */
      _padTime(num, n = 2) {
        let len = num.toString().length
        while (len < 2) {
          num = '0' + num
          len++
        }
        return num
      },
      ...mapActions([
        'savePlayHistory'
      ])
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      Playlist
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
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                top: 0
                left: 0
                width: 100%
                height: 100%
                border-radius: 50%
          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              font-size: $font-size-medium
              line-height: 20px
              color: $color-text
        .middle-r
          display: inline-block
          width: 100%
          height: 100%
          overflow: hidden
          vertical-align: top
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              font-size: $font-size-medium
              line-height: 32px
              color: $color-text-l
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            width: 8px
            height: 8px
            margin: 0 4px
            vertical-align: middle
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0 auto
          padding: 10px 0
          .time
            flex: 0 0 30px
            width: 30px
            font-size: $font-size-small
            line-height: 30px
            color: $color-text
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
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
            .icon-favorite
              color: $color-sub-theme
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
          &.play
            animation: rotate 20s linear infinite
          &.pause
            animation-play-state: paused
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
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          // 因为下面这个样式，即字体颜色有一些透明的效果，使得圆形进度条的进度走动能够被看到
          color: $color-theme-d
        .icon-mini
          position: absolute
          top: 0
          left: 0
          font-size: 32px
  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
