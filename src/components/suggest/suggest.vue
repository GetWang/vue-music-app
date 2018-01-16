<template>
  <scroll class="suggest"
          ref="suggest"
          :data="result"
          :pullup="pullup"
          :beforeScroll="beforeScroll"
          @beforeScroll="listScroll"
          @scrollToEnd="searchMore">
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" v-for="item in result">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import NoResult from 'base/no-result/no-result'
  import { search } from 'api/search'
  import { ERR_OK } from 'api/config'
  import { createSong } from 'common/js/song'
  import Singer from 'common/js/singer'
  import { mapMutations, mapActions } from 'vuex'

  const TYPE_SINGER = 'singer'    // 表示歌手类型的常量
  const perpage = 20              // 表示搜索结果的每页有多少首歌曲

  export default {
    props: {
      query: {
        type: String,
        default: ''
      },
      // 是否在搜索结果中显示歌手
      showSinger: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        page: 1,            // 请求的页码数
        result: [],         // 搜索结果
        pullup: true,       // 是否要上拉刷新
        hasMore: true,      // 是否有更多搜索结果
        beforeScroll: true  // 是否要监听滚动将要开始的事件
      }
    },
    watch: {
      /* 当query发生变化时，获取搜索结果 */
      query() {
        this.search()
      }
    },
    methods: {
      /* 根据每条搜索结果是歌手还是歌曲，得出类型样式 */
      getIconCls(item) {
        if (item.type === TYPE_SINGER) {
          return 'icon-mine'
        } else {
          return 'icon-music'
        }
      },
      /* 根据每条搜索结果是歌手还是歌曲，得出显示的文本 */
      getDisplayName(item) {
        if (item.type === TYPE_SINGER) {
          return item.singername
        } else {
          return `${item.name}-${item.singer}`
        }
      },
      /* 点击不同的搜索结果，跳转到不同的页面（歌手详情页、播放器页面） */
      selectItem(item) {
        // 点击歌手
        if (item.type === TYPE_SINGER) {
          const singer = new Singer({
            id: item.singermid,
            name: item.singername
          })
          this.$router.push({
            path: `/search/${singer.id}`
          })
          this.setSinger(singer)
        } else {
          this.insertSong(item)
        }
        // 当点击了某一个搜索结果后，派发一个表示点击了搜索结果的事件
        this.$emit('select')
      },
      /* 搜索结果列表将要滚动时，派发一个表示列表将要滚动的事件 */
      listScroll() {
        this.$emit('listScroll')
      },
      /* 每当query改变时获取搜索结果 */
      search() {
        this.page = 1             // 重置page为1
        this.hasMore = true       // 重置hasMore为true
        this.$refs.suggest.scrollTo(0, 0)   // 将搜索结果列表滚动到顶部
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (res.code === ERR_OK) {
            this.result = this._genResult(res.data)
            this._checkMore(res.data)
            console.log(res.data)
          }
        })
      },
      /* 获取更多搜索结果 */
      searchMore() {
        if (!this.hasMore) {
          return
        }
        this.page++
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (res.code === ERR_OK) {
            this.result = this.result.concat(this._genResult(res.data))
            this._checkMore(res.data)
            console.log(res.data)
          }
        })
      },
      /* 检查是否有更多的搜索结果 */
      _checkMore(data) {
        const song = data.song
        // 若当前的搜索结果为0或已经拿到了最后一些搜索结果，则没有更多
        if (!song.list.length || (song.curnum + (song.curpage - 1) * perpage) >= song.totalnum) {
          this.hasMore = false
        }
      },
      /* 处理获取到的搜索结果数据，生成我们要的result数组 */
      _genResult(data) {
        let ret = []
        /* 若搜索结果中有歌手数据，就放在result数组中的第一个 */
        if (data.zhida && data.zhida.singerid) {
          ret.push({...data.zhida, ...{type: TYPE_SINGER}})
        }
        if (data.song) {
          ret = ret.concat(this._normalizeSong(data.song.list))
        }
        return ret
      },
      /* 将搜索结果中的歌曲转换成Song的实例 */
      _normalizeSong(list) {
        let ret = []
        list.forEach((item) => {
          let musicData = item
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      }),
      ...mapActions([
        'insertSong'
      ])
    },
    components: {
      Scroll,
      Loading,
      NoResult
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import '~common/stylus/variable'
  @import '~common/stylus/mixin'

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
        .icon
          flex: 0 0 30px
          width: 30px
          [class^="icon-"]
            font-size: 14px
            color: $color-text-d
        .name
          flex: 1
          overflow: hidden
          font-size: $font-size-medium
          color: $color-text-d
          .text
            no-wrap()
    .no-result-wrapper
      position: absolute
      top: 50%
      width: 100%
      transform: translateY(-50%)
</style>
