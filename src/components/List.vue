/**
* Created by newlmy on 2017/8/16.
*/

<template>
  <el-table
    :data="tableData"
    stripe
    border
    style="width: 100%"
    :max-height = "tableHeight"
    @cell-click.self="cellClick"
  >
    <el-table-column
      v-for="(item, index) in tableTitle"
      :key="index"
      :prop="item.prop"
      :label="item.label"
      :width="item.width"
    >
      <template  scope="scope">
        <div @click.stop="clickRow(index,scope.row)" :class="{'is-link': item.click && !!item.click}">{{ scope.row[item.prop] }}</div>
      </template>
    </el-table-column>
    <el-table-column
      label="操作"
      :width="tableOperate.width ? tableOperate.width : 180">
      <template scope="scope">
        <el-button
          v-if="tableOperate.del && tableOperate.del.show"
          @click.stop.prevent="deleteRow(scope.$index)"
          type="text"
          size="small">
          {{tableOperate.del && tableOperate.del.text ? tableOperate.del.text : '删除'}}
        </el-button>
        <el-button
          v-if="tableOperate.look && tableOperate.look.show"
          @click.stop.prevent="lookMore(scope.$index)"
          type="text"
          size="small">
          {{tableOperate.look && tableOperate.look.text ? tableOperate.look.text : '查看'}}
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
  export default {
    name: 'list',
    props: {
      tableTitle: {
        type: Array,
        default () {
          return []
        }
      },
      tableData: {
        type: Array,
        default () {
          return []
        }
      },
      tableOperate: {
        type: Object,
        default () {
          return {}
        }
      }
    },
    data () {
      return {
        tableHeight: (parseInt(document.documentElement.clientHeight) - 200)
      }
    },
    methods: {
      cellClick () {
      },
      deleteRow (index) {
        let _this = this
        _this.$confirm(`确认要${_this.tableOperate.del.text}吗？`)
          .then(_ => {
            _this.$emit('deleteRow', index)
          })
          .catch(_ => {})
      },
      lookMore (index) {
        this.$emit('lookMore', index)
      },
      resizeFn () {
        let _this = this
        window.onresize = function () {
          _this.tableHeight = parseInt(document.documentElement.clientHeight) - 200
        }
      },
      clickRow (index, row) {
        let _this = this
        if (_this.tableTitle[index].click) {
          _this.$emit('clickRow', {index, row})
        } else {
          return
        }
      }
    },
    created () {
      let _this = this
      _this.resizeFn()
    }
  }

</script>

<style scoped>
  .is-link {
    color: #20a0ff;
    cursor: pointer;
  }

</style>
