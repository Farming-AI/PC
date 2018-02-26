/**
* Created by newlmy on 2017/8/16.
*/

<template>
  <div class="content">
    <div class="com-header el-menu--dark" ref="pageHeader">
      <div class="com-header-flex">
        <div class="com-header-title">通用</div>
        <el-menu theme="dark" class="el-menu-demo" mode="horizontal">
          <el-menu-item index="1">用户：{{header.userName}}</el-menu-item>
          <el-menu-item index="2">系统版本：{{header.system}}</el-menu-item>
          <el-menu-item index="3" @click="quit">退出</el-menu-item>
        </el-menu>
      </div>
    </div>
    <div class="com-body" ref="pageBody">
      <div class="com-bd-sidebar el-menu--dark" ref="pageSide">
        <nav-menu :nav-menu="navMenu" @isCollapse = "onCollapse"></nav-menu>
      </div>
      <div class="com-bd-content" :class="{'com-bd-content--shrink': !conBdIsCollapse, 'com-bd-content--stretch': conBdIsCollapse}">
        <div class="com-bd-space">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import NavMenu from 'components/NavMenu'
  import {MenuConfig} from 'src/web.config'
  export default {
    name: 'main',
    data () {
      return {
        header: {
          userName: '小明子',
          system: 'v0.0.0'
        },
        navMenu: MenuConfig,
        conBdIsCollapse: false,
        comBdHeight: (parseInt(document.documentElement.clientHeight) - 30 - 60) + 'px'
      }
    },
    methods: {
      quit () {
        console.log('在这里写退出操作')
      },
      onCollapse (bool) {
        let _this = this
        _this.conBdIsCollapse = bool
      }
    },
    components: {
      navMenu: NavMenu
    },
    created () {
    }
  }
</script>

<style scoped>
  .content {
    height: 100%
  }
  .com-header {
    height: 60px;
    line-height: 60px;
    position: fixed;
    width: 100%;
  }
  .com-header-flex{
    display: flex;
  }
  .com-header-title {
    padding: 0 20px;
    color: #fff;
    flex: 1;
  }
  .com-body {
    position: absolute;
    width: 100%;
    top: 60px;
    bottom: 0px;
    background-color: #000;
  }
  .com-bd-sidebar {
    position: fixed;
    top: 60px;
    bottom: 0;
  }
  .com-bd-content {
    width: auto;
    position: absolute;
    top: 0px;
    left: 0px;
    bottom: 0px;
    right: 0px;
    overflow: auto;
    background: #fff;
  }
  .com-bd-space {
    margin: 15px;
    overflow: auto;
  }
  .com-bd-content--stretch {
    left: 64px;
    transition: left .3s;
  }
  .com-bd-content--shrink {
    left: 200px;
    transition: left .5s;

  }
</style>
