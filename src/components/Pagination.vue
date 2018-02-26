/**
* Created by newlmy on 2017/8/26.
*/

<template>
  <div class="pagination block">
    <div class="pagination-position">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-size="pageSize"
        layout="total, prev, pager, next"
        :total="1000">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'pagination',
    props: {
      pageSize: {
        type: Number,
        default () {
          return 100
        }
      },
      totalNum: {
        type: Number,
        default () {
          return 100
        }
      },
      current: {
        type: Number,
        default () {
          return 1
        }
      }
    },
    data () {
      return {
        currentPage: this.current
      }
    },
    methods: {
      handleSizeChange (val) {
        let _this = this
        _this.$emit('handleSizeChange', val)
      },
      handleCurrentChange (val) {
        let _this = this
        _this.$emit('handleCurrentChange', val)
      }
    }
  }
</script>

<style scoped>
  .pagination {
    margin-top: 15px;
    position: relative;
    height: 32px;
  }
  .pagination-position {
    position: absolute;
    right: 0;
  }
</style>
