<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'

  export default {
    props: {
      probeType: {
        type: Number,
        default: 1
      },
      click: {
        type: Boolean,
        default: true
      },
      data: {
        type: Array,
        default: null
      },
      // 表示是否要监听滚动事件
      listenScroll: {
        type: Boolean,
        default: false
      },
      /* 表示是否要扩展上拉刷新的功能（具体由外部实现，本组件
         只负责告诉外部什么时候要上拉刷新） */
      pullup: {
        type: Boolean,
        default: false
      },
      // 表示是否要监听BScroll实例派发的beforeScroll事件（在滚动前触发）
      beforeScroll: {
        type: Boolean,
        default: false
      }
    },
    mounted() {
      setTimeout(() => {
        this._initScroll()
      }, 20)
    },
    methods: {
      _initScroll() {
        if (!this.$refs.wrapper) {
          return
        }
        this.scroll = new BScroll(this.$refs.wrapper, {
          probeType: this.probeType,
          click: this.click
        })
        if (this.listenScroll) {
          let me = this
          this.scroll.on('scroll', (pos) => {   // pos为滚动的位置
            me.$emit('scroll', pos)             // 触发滚动组件的scroll事件
          })
        }
        if (this.pullup) {
          this.scroll.on('scrollEnd', () => {
            // 如果快要滚动到底部时，派发一个表示将要滚动到底部的事件，以告诉外部
            if (this.scroll.y < (this.scroll.maxScrollY + 50)) {
              this.$emit('scrollToEnd')
            }
          })
        }
        if (this.beforeScroll) {
          // 滚动将要开始时，派发一个表示将要开始滚动的事件
          this.scroll.on('beforeScroll', () => {
            this.$emit('beforeScroll')
          })
        }
      },
      disable() {
        this.scroll && this.scroll.disable()
      },
      enable() {
        this.scroll && this.scroll.enable()
      },
      refresh() {
        this.scroll && this.scroll.refresh()
      },
      scrollTo() {
        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
      },
      scrollToElement() {       // 滚动到指定的DOM元素的位置
        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
      }
    },
    watch: {
      data() {
        setTimeout(() => {
          this.refresh()
        }, 20)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

</style>
