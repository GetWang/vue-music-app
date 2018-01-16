<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input ref="query" class="box" v-model="query" :placeholder="placeholder" type="text"/>
    <i @click="dismiss" class="icon-dismiss" v-show="query"></i>
  </div>
</template>

<script type="text/ecmascript-6">
  import { debounce } from 'common/js/util'

  export default {
    props: {
      placeholder: {
        type: String,
        default: '搜索歌曲、歌手'
      }
    },
    data() {
      return {
        query: ''
      }
    },
    /* 在组件created生命周期时开始监听query，
       并对query改变时要执行的函数作节流处理 */
    created() {
      this.$watch('query', debounce((newQuery) => {
        this.$emit('query', newQuery)
      }, 200))
    },
    methods: {
      dismiss() {
        this.query = ''
      },
      setQuery(query) {
        this.query = query
      },
      /* 让输入框失去焦点 */
      blur() {
        this.$refs.query.blur()
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import '~common/stylus/variable'

  .search-box
    display: flex
    align-items: center
    box-sizing: border-box
    width: 100%
    height: 40px
    paddding: 0 6px
    border-radius: 6px
    background: $color-highlight-background
    .icon-search
      font-size: 24px
      color: $color-background
    .box
      flex: 1
      margin: 0 5px
      line-height: 18px
      font-size: $font-size-medium
      color: $color-text
      background: $color-highlight-background
      &::placeholder
        color: $color-text-d
    .icon-dismiss
      font-size: 16px
      color: $color-background
</style>
