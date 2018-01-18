<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <search-box ref="searchBox" placeholder="搜索歌曲" @query="onQueryChange"></search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <switches :switches="switches" :currentIndex="currentIndex"
                  @switch="switchItem"></switches>
        <div class="list-wrapper">
          <scroll ref="songList" class="list-scroll" :data="playHistory" v-if="currentIndex === 0">
            <div class="list-inner">
              <song-list @select="selectSong" :songs="playHistory"></song-list>
            </div>
          </scroll>
          <scroll ref="searchList" class="list-scroll"
                  :data="searchHistory" v-if="currentIndex === 1"
                  :refreshDelay="refreshDelay">
            <div class="list-inner">
              <search-list :searches="searchHistory" @select="addQuery"
                           @delete="deleteSearchHistory"></search-list>
            </div>
          </scroll>
        </div>
      </div>
      <div class="search-result" v-show="query">
        <suggest :query="query" @listScroll="blurInput"
                 @select="selectSuggest" :showSinger="showSinger"></suggest>
      </div>
      <top-tip ref="topTip">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经添加到播放列表</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import SearchBox from 'base/search-box/search-box'
  import Suggest from 'components/suggest/suggest'
  import Switches from 'base/switches/switches'
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list'
  import SearchList from 'base/search-list/search-list'
  import TopTip from 'base/top-tip/top-tip'
  import { searchMixin } from 'common/js/mixin'
  import { mapGetters, mapActions } from 'vuex'
  import Song from 'common/js/song'

  export default {
    data() {
      return {
        showFlag: false,
        showSinger: false,    // 不在搜索结果中显示歌手
        currentIndex: 0,      // 默认tab为播放历史
        /* tabs数据 */
        switches: [
          {
            name: '最近播放'
          },
          {
            name: '搜索历史'
          }
        ]
      }
    },
    /* 使用了跟搜索相关的混合，即和搜索页面共用了搜索相关的逻辑 */
    mixins: [searchMixin],
    watch: {
      query(newQuery) {
        if (!newQuery) {
          if (this.currentIndex === 0) {
            setTimeout(() => {
              this.$refs.songList.refresh()
            }, 20)
          } else {
            setTimeout(() => {
              this.$refs.searchList.refresh()
            }, 20)
          }
        }
      }
    },
    computed: {
      ...mapGetters([
        'playHistory'
      ])
    },
    methods: {
      show() {
        this.showFlag = true
        /* 当添加歌曲组件显示时，需要手动刷新当前的tab的scroll组件 */
        if (this.currentIndex === 0) {
          setTimeout(() => {
            this.$refs.songList.refresh()
          }, 20)
        } else {
          setTimeout(() => {
            this.$refs.searchList.refresh()
          }, 20)
        }
      },
      hide() {
        this.showFlag = false
      },
      /* 切换tab */
      switchItem(index) {
        this.currentIndex = index
      },
      /* 当点击播放历史中的非第一首歌曲时，将该歌曲插入播放列表中，并在顶部显示tip */
      selectSong(song, index) {
        if (index !== 0) {
          this.insertSong(new Song(song))
          this.$refs.topTip.show()
        }
      },
      /* 当点击搜索结果列表中的歌曲时，将该歌曲插入播放列表中，并在顶部显示tip */
      selectSuggest() {
        this.saveSearch()
        this.$refs.topTip.show()
      },
      ...mapActions([
        'insertSong'
      ])
    },
    components: {
      SearchBox,
      Suggest,
      Switches,
      Scroll,
      SongList,
      SearchList,
      TopTip
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import '~common/stylus/variable'
  @import '~common/stylus/mixin'

  .add-song
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 200
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .header
      position: relative
      height: 44px
      text-align: center
      .title
        font-size: $font-size-large
        line-height: 44px
        color: $color-text
      .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme
    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          height: 100%
          overflow: hidden
          .list-inner
            padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      padding: 18px 0
      text-align: center
      font-size: 0
      .icon-ok
        margin-right: 4px
        font-size: $font-size-medium
        color: $color-theme
      .text
        font-size: $font-size-medium
        color: $color-text
</style>
