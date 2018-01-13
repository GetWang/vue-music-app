<template>
  <transition name="slide">
    <music-list :title="title" :bgImage="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import MusicList from 'components/music-list/music-list'
  import { mapGetters } from 'vuex'
  import { getDiscDetail } from 'api/recommend'
  import { ERR_OK } from 'api/config'
  import { createSong } from 'common/js/song'

  export default {
    data() {
      return {
        songs: []
      }
    },
    computed: {
      title() {
        return this.disc.dissname
      },
      bgImage() {
        return this.disc.imgurl
      },
      ...mapGetters([
        'disc'
      ])
    },
    created() {
      this._getDiscDetail()
    },
    methods: {
      _getDiscDetail() {
        /* 若在歌单详情页刷新页面，因为此时store中的disc为空对象，
           故不能获取到数据，直接跳转到推荐页面 */
        if (!this.disc.dissid) {
          this.$router.push('/recommend')
          return
        }
        getDiscDetail(this.disc.dissid).then((res) => {
          console.log(res)
          if (res.code === ERR_OK) {
            // this.songs = this._normalize(res.cdlist[0].songlist)
            // console.log(res)
          }
        })
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((musicData) => {
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
    transition: all 0.3s
  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
