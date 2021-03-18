# vue-music-app

> 在线演示：[Vue 移动端音乐 WebApp](https://getwang.github.io/music-app/)

## Description

- 使用`Vue 2.x`、`Vuex`、`Vue-Router`、`ES6`、`Webpack`、`Stylus`技术栈。其中 Webpack 的大部分配置使用`vue-cli`脚手架完成。

- 该应用的`UI`基本仿照移动端QQ音乐的用户界面，实际体验非常逼近移动端原生音乐类 App。

- 开发过程中，封装了较多的组件——基础组件（如进度条组件、滚动组件 、弹窗组件、通讯录列表组件）、业务组件（歌手页面组件、播放器内核组件、排行榜页面组件、用户中心页组件）。

- 项目中使用了一些 ES6 语法和 API，如`Promise`；通过HTML5的本地存储 API `localStorage`保存用户的播放历史、收藏歌曲，也使用到关于Audio的一些 API；App 中关于播放器的交互动画使用CSS3实现。

- 应用的数据均抓取自QQ音乐的线上真实数据，使用`axios`、`jsonp`库发起跨域请求。
使用滚动库`better-scroll`实现 App 中的轮播图以及页面的滚动；借助 Vue 插件-`vue-lazyload`完成图片的懒加载。

- 歌词数据的解析使用到三方库`js-base64`、`lyric-parser`。

### Preview

![预览图](https://github.com/GetWang/vue-music-app/blob/master/src/common/image/screenshot1.PNG)

![预览图](https://github.com/GetWang/vue-music-app/blob/master/src/common/image/screenshot2.PNG)


## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).


## About me
- 源代码地址：>>[GitHub](https://github.com/GetWang/vue-music-app)

- 个人博客：[GetWang' Blog](https://getwang.github.io/)

- GitHub：[GetWang](https://github.com/GetWang)

- My resume：[Resume-of-GetWang](https://getwang.github.io/Resume-of-GetWang/)