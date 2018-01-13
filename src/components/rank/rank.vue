<template>
  <div class="rank" ref="rank">
    <scroll class="toplist" :data="topList" ref="topList">
      <ul>
        <li @click="selectItem(item)" class="item" v-for="item in topList">
          <div class="icon">
            <img v-lazy="item.picUrl" width="100" height="100"/>
          </div>
          <ul class="songlist">
            <li class="song" v-for="(song, index) in item.songList">
              <span>{{ index + 1 }}</span>
              <span>{{ song.songname }}-{{ song.singername }}</span>
            </li>
          </ul>
        </li>
      </ul>
      <div class="loading-container" v-show="!topList.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>


<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import { getTopList } from 'api/rank'
  import { ERR_OK } from 'api/config'
  import { mapMutations } from 'vuex'
  import { playlistMixin } from 'common/js/mixin'

  export default {
    data() {
      return {
        topList: []
      }
    },
    created() {
      this._getTopList()
    },
    mixins: [playlistMixin],
    methods: {
      selectItem(item) {
        this.$router.push({
          path: `/rank/${item.id}`
        })
        this.setTopList(item)
      },
      /* 这里使用mixin根据播放器的播放列表解决排行页面底部与mini播放器不适配的问题 */
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.rank.style.bottom = bottom
        this.$refs.topList.refresh()
      },
      /* 获取排行页面数据 */
      _getTopList() {
        getTopList().then((res) => {
          if (res.code === ERR_OK) {
            this.topList = res.data.topList
          }
        })
      },
      ...mapMutations({
        setTopList: 'SET_TOP_LIST'
      })
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>


<style scoped lang="stylus" rel="stylesheet/stylus">
  @import '~common/stylus/variable'
  @import '~common/stylus/mixin'

  .rank
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
    .toplist
      height: 100%
      overflow: hidden
      .item
        display: flex
        align-items: center
        height: 100px
        margin: 0 20px
        padding-top: 20px
        &:last-child
          padding-bottom: 20px
        .icon
          flex: 0 0 100px
          width: 100px
          height: 100px
        .songlist
          flex: 1
          display: flex
          flex-direction: column
          justify-content: center
          height: 100px
          padding: 0 20px
          overflow: hidden
          font-size: $font-size-small
          color: $color-text-d
          background: $color-highlight-background
          .song
            no-wrap()
            line-height: 26px
      .loading-container
        position: absolute
        top: 50%
        width: 100%
        transform: translateY(-50%)
</style>
