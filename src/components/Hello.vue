<template>
  <div class="hello">
    <h1 class="a">{{ msg }}</h1>
    <p>测试页面间css的关系</p>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'hello',
  data () {
    return {
      tableData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄'
      }],
      msg: 'Welcome to Your Vue.js App'
    }
  },
  computed: {
    'msg1': function () {
      console.log(1111)
      return this.msg + ' haha'
    }
  },
  methods: {
    msg2: function () {
      console.log(222)
      return this.msg + 'haha'
    },
    handleOpen (key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose (key, keyPath) {
      console.log(key, keyPath)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1{
    font-size: 40px;
    color: red
  }
  .a{
    font-weight: 900;
  }
   p{
     font-size: 30px;
   }

</style>
