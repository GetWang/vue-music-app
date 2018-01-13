<template>
  <transition name="slide">
    <music-list :rank="rank" :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import MusicList from 'components/music-list/music-list'
  import { mapGetters } from 'vuex'
  import { getTopDetail } from 'api/rank'
  import { ERR_OK } from 'api/config'
  import { createSong } from 'common/js/song'

  export default {
    data() {
      return {
        songs: [],
        rank: true
      }
    },
    computed: {
      title() {
        return this.topList.topTitle
      },
      bgImage() {
        // 排行榜详情页背景图片使用歌曲列表中第一首歌曲的背景图片
        if (this.songs.length) {
          return this.songs[0].image
        }
        return ''
      },
      ...mapGetters([
        'topList'
      ])
    },
    created() {
      /* 若在排行榜详情页刷新页面，因为此时store中的topList为空对象，
         故不能获取到数据，直接跳转到排行页面 */
      if (!this.topList.id) {
        this.$router.push('/rank')
        return
      }
      this._getTopDetail()
    },
    methods: {
      /* 获取排行榜详情页数据 */
      _getTopDetail() {
        getTopDetail(this.topList.id).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSong(res.songlist)
          }
        })
      },
      _normalizeSong(list) {
        let ret = []
        list.forEach((item) => {
          const musicData = item.data
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    components: {
      MusicList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s ease
  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
