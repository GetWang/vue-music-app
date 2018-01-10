<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import { prefixStyle } from 'common/js/dom'

  const progressBtnWidth = 16       // 进度拖拽按钮的宽度
  const transform = prefixStyle('transform')

  export default {
    props: {
      // 歌曲当前播放进度百分比
      percent: {
        type: Number,
        default: 0
      }
    },
    created() {
      this.touch = {}     // 存放跟touch相关的数据
    },
    watch: {
      /* 监听歌曲当前播放进度百分比，当变化时，进度和拖拽按钮位置也变化 */
      percent(newPercent) {
        /* 改变进度之前，先要判断一下当前是否在手动拖拽按钮，若是，则这里不去改变进度，而由手动拖拽去改变进度 */
        if (newPercent >= 0 && !this.touch.initialed) {
          let barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
          let offsetWidth = barWidth * newPercent
          this._offset(offsetWidth)
        }
      }
    },
    methods: {
      /* 拖拽按钮上的touchstart事件处理函数 */
      progressTouchStart(e) {
        this.touch.initialed = true     // 进度条内发生touchstart事件的标志位
        this.touch.startX = e.touches[0].pageX
        this.touch.left = this.$refs.progress.clientWidth   // 记录进度条已经走过的长度
      },
      /* 拖拽按钮上的touchmove事件处理函数 */
      progressTouchMove(e) {
        /* 当未在进度条内触发touchstart事件，而触发了touchmove事件时退出，因为这不是我们希望的进度条内的拖拽 */
        if (!this.touch.initialed) {
          return
        }
        /* 计算出进度按钮拖拽的距离 */
        const deltaX = e.touches[0].pageX - this.touch.startX
        /* 计算出拖拽按钮应有的偏移量，并限定最大偏移量和最小偏移量 */
        const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))
        this._offset(offsetWidth)
      },
      /* 拖拽按钮上的touchend事件处理函数 */
      progressTouchEnd() {
        this.touch.initialed = false    // 清除进度条内发生touchstart事件的标志位
        this._triggerPercent()          // 向父组件派发一个播放百分比发生变化的事件
      },
      /* 点击进度条的某个位置时，改变进度及拖拽按钮的位置，也向父组件派发一个播放百分比发生变化的事件 */
      progressClick(e) {
        const offsetWidth = e.offsetX   // e.offsetX表示进度条点击位置相对自身的偏移量
        this._offset(offsetWidth)
        this._triggerPercent()
      },
      /* 拖拽完进度按钮后，向父组件派发一个事件，告诉父组件歌曲当前播放百分比发生了变化 */
      _triggerPercent() {
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        const percent = this.$refs.progress.clientWidth / barWidth
        this.$emit('percentChange', percent)
      },
      /* 设置进度条走的进度及拖拽按钮移动的距离 */
      _offset(offsetWidth) {
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import '~common/stylus/variable'

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px         // 该属性和下面的height属性将该元素垂直居中
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        top: 0
        left: 0
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        top: -13px      // 该属性和下面的left、width、height属性使进度拖拽按钮在进度条中水平居左、垂直居中
        left: -8px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px      // 该属性和下面的left、width、height属性使该元素在父容器中水平、垂直居中
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
