<template>
  <div class="m-header">
    <div class="icon"></div>
    <h1 class="text">Chicken Music</h1>
    <router-link class="mine" tag="div" to="/user">
      <i class="icon-mine"></i>
    </router-link>
  </div>
</template>



<script type="text/ecmascript-6">
  export default {}
</script>



<style scoped lang="stylus" rel="stylesheet/stylus">
  @import '~common/stylus/variable'
  @import '~common/stylus/mixin'

  .m-header
    position: relative
    height: 44px
    text-align: center
    font-size: 0
    line-height: 44px
    color: $color-theme
    .icon
      display: inline-block
      width: 30px
      height: 32px
      margin-top: 6px
      margin-right: 9px
      vertical-align: top
      bg-image('logo')
      background-size: 30px 32px
    .text
      display: inline-block
      height: 44px
      vertical-align: middle
      linge-height: 44px
      font-size: $font-size-large
    .mine
      position: absolute
      top: 0
      right: 0
      .icon-mine
        display: block
        padding: 12px
        font-size: 20px
        color: $color-theme
</style>
