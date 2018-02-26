/**
* Created by newlmy on 2017/8/16.
*/

<template>
  <nav class="nav-sidebar">
    <div class="com-bd-sidebar-fold" :class="{'com-bd-content--shrink': isCollapse}" @click="sidebarFold">|||</div>
    <el-menu theme="dark" :collapse="isCollapse" class="nav-menu" :class="{'com-bd-content--shrink': isCollapse}">
      <template v-for="(item, index) in navMenu">
        <template v-if="item.sunData && item.sunData.length">
          <el-submenu :index="index+''">
            <template slot="title">
              <i :class="item.icon"></i>
              <span slot="title">{{item.text}}</span>
            </template>
            <template v-for="(i, n) in item.sunData">
              <el-menu-item :index="index+'-'+n">
                <router-link :to="i.link"> {{i.text}}</router-link>
              </el-menu-item>
            </template>
          </el-submenu>
        </template>
      </template>
    </el-menu>
  </nav>
</template>
<script>
  export default {
    name: 'NavMenu',
    props: {
      navMenu: {
        type: Array,
        default: [
          {
            title: '选项一',
            url: '',
            icon: '',
            sunData: {
              title: '一：子选项1',
              url: ''
            }
          },
          {
            title: '选项一',
            url: '',
            icon: '',
            sunData: {
              title: '一：子选项1',
              url: ''
            }
          }
        ]
      }
    },
    data () {
      return {
        isCollapse: false,
        uniqueOpened: true,
        isRouter: true
      }
    },
    methods: {
      sidebarFold () {
        let _this = this
        _this.isCollapse = !_this.isCollapse
        _this.$emit('isCollapse', _this.isCollapse)
      }
    }
  }

</script>

<style scoped>
  .com-bd-sidebar-fold {
    height: 30px;
    width: 200px;
    background: #4A5064;
    color: #aeb9c2;
    text-align: center;
    line-height: 30px !important;
    font-size: 12px;
    user-select: none;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    transition: width .5s;
  }
  .com-bd-content--shrink {
    width: 64px;
    transition: width .3s;

  }
  .nav-sidebar{
    height: 100%;
    overflow: hidden;
  }
  .nav-menu {
    overflow: auto;
    height: calc(100% - 30px)
  }
  .nav-menu:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
  }
  .nav-menu li a{display:block;color:white;font-size:15px;padding:0 20px 0 20px;line-height:50px;cursor:pointer;transition:0.3s;}
  .nav-menu li a.active{color:#3399FF;}
  .nav-menu li a:hover{text-decoration:none;}
  .nav-menu li>.icon{width:50px;height:40px;display:inline-block;text-align:center;font-size:24px;}
  .nav-menu .router-link-active {
    color: #20a0ff;
  }
</style>
