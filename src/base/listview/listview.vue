<template>
  <scroll class="listview" :data="data" ref="listview"
          :listenScroll="listenScroll"
          :probeType="probeType"
          @scroll="scroll">
    <ul>
      <li v-for="group in data" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{ group.title }}</h2>
        <ul>
          <li @click="selectItem(item)" class="list-group-item" v-for="item in group.items">
            <img v-lazy="item.avatar" class="avatar">
            <span class="name">{{ item.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut" @touchstart="onShortcutTouchStart"
         @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li class="shortcut-item" v-for="(item, index) in shortcutList"
            :data-index="index" :class="{ current: currentIndex === index }">{{ item }}</li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="listFixed">
      <h2 class="fixed-title">{{ fixedTitle }}</h2>
    </div>
    <div class="loading-container" v-show="!data.length">
      <loading></loading>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import { getData } from 'common/js/dom'

  const ANCHOR_HEIGHT = 18    // 右侧快速入口每个锚点的高度
  const TITLE_HEIGHT = 30     // 歌手分组标题栏的高度

  export default {
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    data() {
      return {
        scrollY: -1,        // scrollY为当前滚动的Y轴位置，该值为负值
        currentIndex: 0,
        diff: -1            // diff表示当前歌手分组的上限高度与歌手列表位置scrollY的差值，
      }                     // 即当前歌手分组的上限位置离歌手页面顶部的距离
    },
    computed: {
      /* 右侧快速入口列表 */
      shortcutList() {
        return this.data.map((group) => {
          return group.title.substr(0, 1)
        })
      },
      /* 固定标题栏的标题 */
      fixedTitle() {
        /* 若滚动到页面顶部，则隐藏固定标题栏 */
        if (this.scrollY > 0) {
          return ''
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    created() {
      this.touch = {}         // 保存与touch相关的数据，因为不需要被Vue监听，故直接存放在Vue实例属性上
      this.listenScroll = true    // 需要监听滚动事件
      this.listHeight = []        // 保存每个歌手分组的高度
      this.probeType = 3          // 监听滚动事件不需要节流，即实时监听
      this.fixedTop = 0           // 歌手页面标题固定栏Y轴上的translate值
    },
    watch: {
      data() {
        setTimeout(() => {
          this._calculateHeight()
        }, 20)
      },
      scrollY(newY) {    // newY为当前滚动的Y轴位置
        const listHeight = this.listHeight
        /* 当滚动到顶部，newY > 0，则第一个快速入口处于激活状态 */
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
        /* 在中间部分滚动，newY < 0 */
        for (let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i]       // 下限高度
          let height2 = listHeight[i + 1]   // 上限高度
          if ((-newY >= height1) && (-newY < height2)) {
            this.currentIndex = i
            this.diff = height2 + newY      // 当歌手列表滚动时，计算diff
            return
          }
        }
        /* 当滚动到底部（newY < 0），且-newY大于最后一个歌手分组的上限，则最后一个快速入口处于激活状态 */
        this.currentIndex = listHeight.length - 2
      },
      /* 当差值大于0且小于等于歌手分组标题栏高度时，将歌手页面固定的标题栏往上（下）移动，即往Y轴负（正）方向移动 */
      diff(newVal) {
        let fixedTop = (newVal > 0 && newVal <= TITLE_HEIGHT) ? (newVal - TITLE_HEIGHT) : 0
        /* 为了减少下面不必要的DOM操作（transform），做个判断 */
        if (this.fixedTop === fixedTop) {
          return
        }
        this.fixedTop = fixedTop
        this.$refs.listFixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`   // 这里开启了GPU加速
      }
    },
    methods: {
      selectItem(item) {
        this.$emit('select', item)
      },
      onShortcutTouchStart(e) {
        let anchorIndex = parseInt(getData(e.target, 'index'))   // 获取所触碰到的锚点（某个快速入口）的索引
        let firstTouch = e.touches[0]
        this.touch.y1 = firstTouch.pageY
        this.touch.anchorIndex = anchorIndex    // 保存所触碰到的锚点（某个快速入口）的索引
        this._scrollTo(this.touch.anchorIndex)
      },
      onShortcutTouchMove(e) {
        let firstTouch = e.touches[0]
        this.touch.y2 = firstTouch.pageY
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
        let anchorIndex = this.touch.anchorIndex + delta   // 计算出touchmove后锚点（某个快速入口）的索引
        this._scrollTo(anchorIndex)
      },
      /* 每当滚动事件发生时，更新滚动的Y轴位置 */
      scroll(pos) {
        this.scrollY = pos.y
      },
      /* 计算每个歌手分组的高度 */
      _calculateHeight() {
        this.listHeight = []
        const list = this.$refs.listGroup
        let height = 0
        this.listHeight.push(height)
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          height += item.clientHeight
          this.listHeight.push(height)
        }
      },
      /* 滚动到指定索引的歌手分组的位置 */
      _scrollTo(index) {
        /* 处理index为null的情况，即touch到了快速入口的边缘 */
        if (!index && index !== 0) {
          return
        }
        /* 处理touchmove到非快速入口有效锚点的位置情况，即index的边缘问题 */
        if (index < 0) {
          index = 0
        } else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }
        this.scrollY = -this.listHeight[index]    // 手动更改scrollY属性的值，以使相应的快速入口有激活的样式
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      }
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        padding-left: 20px
        line-height: 30px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          font-size: $font-size-medium
          color: $color-text-l
    .list-shortcut
      position: absolute
      top: 50%
      right: 0
      z-index: 30
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      font-family: Helvetica
      background: $color-background-d
      .shortcut-item
        padding: 3px
        font-size: $font-size-small
        line-height: 1
        color: $color-text-l
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      z-index: 30
      width: 100%
      .fixed-title
        height: 30px
        padding-left: 20px
        font-size: $font-size-small
        line-height: 30px
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      top: 50%
      width: 100%
      transform: translateY(-50%)
</style>
