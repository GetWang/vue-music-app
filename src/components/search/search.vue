<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div class="shortcut-wrapper" v-show="!query">
      <div class="shortcut">
        <div class="hot-key">
          <h1 class="title">热门搜索</h1>
          <ul>
            <li @click="addQuery(item.k)" v-for="item in hotKey" class="item">
              <span>{{ item.k }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="search-result" v-show="query">
      <suggest @listScroll="blurInput" @select="saveSearch" :query="query"></suggest>
    </div>
    <router-view></router-view>
  </div>
</template>


<script type="text/ecmascript-6">
  import SearchBox from 'base/search-box/search-box'
  import Suggest from 'components/suggest/suggest'
  import { getHotKey } from 'api/search'
  import { ERR_OK } from 'api/config'
  import { mapActions } from 'vuex'

  export default {
    data() {
      return {
        hotKey: [],
        query: ''
      }
    },
    created() {
      this._getHotKey()
    },
    methods: {
      /* 点击热门搜索词后，设置搜索框的query */
      addQuery(query) {
        this.$refs.searchBox.setQuery(query)
      },
      onQueryChange(query) {
        this.query = query
      },
      /* 搜索结果列表将要滚动时，让输入框失去焦点 */
      blurInput() {
        this.$refs.searchBox.blur()
      },
      saveSearch() {
        this.saveSearchHistory(this.query)
      },
      /* 获取热门搜索词 */
      _getHotKey() {
        getHotKey().then((res) => {
          if (res.code === ERR_OK) {
            this.hotKey = res.data.hotkey.slice(0, 10)
            console.log(res.data.hotkey)
          }
        })
      },
      ...mapActions([
        'saveSearchHistory'
      ])
    },
    components: {
      SearchBox,
      Suggest
    }
  }
</script>


<style scoped lang="stylus" rel="stylesheet/stylus">
  @import '~common/stylus/variable'

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            margin: 0 20px 10px 0
            padding: 5px 10px
            border-radius: 6px
            font-size: $font-size-medium
            color: $color-text-d
            background: $color-highlight-background
    .search-result
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
</style>
