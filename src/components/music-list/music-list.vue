<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <!-- <div class="bg-layer"></div>  自己的方法 -->
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="filter" ref="filter"></div>
      <div class="play-wrapper">
        <div class="playBtn" v-show="songs.length > 0" @click="random" ref="playBtn">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll class="list" :data="songs" ref="list"
            :probe-type="probeType"
            :listen-scroll="listenScroll"
            @scroll="scroll">
      <div class="song-list-wrapper">
        <song-list @select="selectItem" :songs="songs" :rank="rank"></song-list>
      </div>
      <div class="loading-container" v-show="!songs.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
  import SongList from 'base/song-list/song-list'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import { prefixStyle } from 'common/js/dom'
  import { mapActions } from 'vuex'
  import { playlistMixin } from 'common/js/mixin'

  /* 保留的高度，也即歌手详情页顶部标题的高度 */
  const RESERVED_HEIGHT = 30
  const transform = prefixStyle('transform')
  const backdrop = prefixStyle('backdrop-filter')

  export default {
    props: {
      bgImage: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: []
      },
      title: {
        type: String,
        default: ''
      },
      // 设置song-list组件中的歌曲是否要有排行的样式
      rank: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        scrollY: -1
      }
    },
    created() {
      this.probeType = 3
      this.listenScroll = true
    },
    mounted() {
      // 保存歌手背景图片的高度
      this.imageHeight = this.$refs.bgImage.clientHeight
      // 计算并保存添加的背景层往Y轴方向所能移动的最小值（数值上最小）
      this.minTranslateHeight = -this.imageHeight + RESERVED_HEIGHT
      this.$refs.list.$el.style.top = `${this.imageHeight}px`
    },
    computed: {
      bgStyle() {
        return `background-image: url(${this.bgImage})`
      }
    },
    mixins: [playlistMixin],
    methods: {
      /* 保存当前滚动位置的Y轴方向的坐标 */
      scroll(pos) {
        this.scrollY = pos.y
      },
      /* 从歌手详情页返回到歌手页面 */
      back() {
        this.$router.back()
      },
      /* 选择歌曲列表中的某一首歌曲进行播放 */
      selectItem(item, index) {
        this.selectPlay({
          list: this.songs,
          index: index
        })
      },
      /* 这里使用mixin根据播放器的播放列表解决音乐列表底部与mini播放器不适配的问题 */
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.list.$el.style.bottom = bottom
        this.$refs.list.refresh()
      },
      /* 随机播放歌曲列表中的歌曲 */
      random() {
        this.randomPlay({
          list: this.songs
        })
      },
      ...mapActions([
        'selectPlay',
        'randomPlay'
      ])
    },
    watch: {
      /* 将添加的背景层往Y轴方向移动 */
      scrollY(newY) {
        let translateY = Math.max(this.minTranslateHeight, newY)
        let zIndex = 0
        let scale = 1
        let blur = 0
        this.$refs.layer.style[transform] = `translate3d(0, ${translateY}px, 0)`
        /* 实现背景图片放大和下拉的效果，针对iOS设备作渐进增强——向上滚动有高斯模糊的效果 */
        let percent = Math.abs(newY / this.imageHeight)
        if (newY > 0) {
          scale = 1 + percent
          /* 因为滚动组件层级高于背景图片，需提高背景图片的层级才能看到背景图片高度的增大，即无缝贴合歌曲列表顶部的下拉效果 */
          zIndex = 10
          this.$refs.bgImage.style[transform] = `scale(${scale})`
        } else {
          blur = Math.min(20 * percent, 20)
          this.$refs.filter.style[backdrop] = `blur(${blur}px)`
        }
        /* 当歌曲列表滚动到页面标题临界点时，提高或降低背景图片的层级，同时将图片的高度设置为保留的高度或原来的高度 */
        if (newY < this.minTranslateHeight) {
          zIndex = 10
          this.$refs.bgImage.style.paddingTop = 0
          this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
          this.$refs.playBtn.style.display = 'none'
        } else {
          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0
          this.$refs.playBtn.style.display = ''
        }
        this.$refs.bgImage.style.zIndex = zIndex
      }
    },
    components: {
      SongList,
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import '~common/stylus/variable'
  @import '~common/stylus/mixin'

  .music-list
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    z-index: 100
    background: $color-background
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
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    /* 自己想到一个方法实现歌曲列表向上滚动时，能滚动到歌手背景图片上，不过还待完善
    .bg-layer
      position: absolute
      top: 0
      left: 0
      width: 100%
      height: 40px
      z-index: 30 */
    .bg-image
      position: relative
      width: 100%
      height: 0
      /* 参照的是父元素宽度的70%，也即参照浏览器视口宽度的70%，实质上就是背景图片自身宽度的70%，即宽高比为10:7 */
      padding-top: 70%
      background-size: cover
      transform-origin: top
      /* 蒙层效果 */
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .playBtn
          width: 135px
          padding: 7px
          margin: 0 auto
          border: 1px solid $color-theme
          border-radius: 100px
          box-sizing: border-box
          text-align: center
          font-size: 0
          color: $color-theme
          .icon-play
            display: inline-block
            margin-right: 6px
            vertical-align: middle
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
        // background: $color-background     自己的方法
      .loading-container
        position: absolute
        top: 50%
        width: 100%
        transform: translateY(-50%)
</style>
