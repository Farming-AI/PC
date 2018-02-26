/**
* Created by newlmy on 2017/8/25.
*/

<template>
  <div class="common-search-bar">
    <div class="common-search-item common-search-select" v-if="filterConfig.select.show">
      <el-select v-model="result.selected" filterable :placeholder="filterConfig.select.placeholder" @change="selectChange">
        <el-option
          v-for="item in filterConfig.select.ops"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </div>
    <div class="common-search-date" v-if="filterConfig.date.show">
      <div class="block" >
        <span class="demonstration">{{filterConfig.date.lable}}</span>
        <el-date-picker
          v-model="result.date"
          type="daterange"
          :placeholder="filterConfig.date.placeholder"
          :format="filterConfig.date.format"
          @change="dateChange"
        >
        </el-date-picker>
      </div>
    </div>
    <div class="common-search-item common-search-input" v-if="filterConfig.search.show">
      <el-input v-model="result.searchText" :placeholder="filterConfig.search.placeholder"></el-input>
    </div>
    <div class="common-search-item common-search-btn">
      <el-button type="primary" @click="sendSearch">{{filterConfig.btn.text}}</el-button>
    </div>
  </div>
</template>

<script>
  import {isEmpty} from 'utils/index'
  export default {
    name: 'filter',
    data () {
      return {
        result: {
          selected: '',
          date: '',
          searchText: ''
        }

      }
    },
    props: {
      filterConfig: {
        type: Object,
        default () {
          return {
            select: {
              show: false,
              require: false,
              msg: '下拉选择搜索内容',
              placeholder: '请选择',
              ops: [{
                value: '',
                label: '请选择'
              }],
              seletced: ''
            },
            date: {
              lable: '',
              show: false,
              require: false,
              format: 'yyyy-MM-dd',
              placeholder: '请选择',
              selected: []
            },
            search: {
              show: false,
              require: false,
              text: '',
              placeholder: '请输入搜索内容'
            },
            btn: {
              text: '搜索'
            }
          }
        }
      }
    },
    mouted () {
    },
    methods: {
      selectChange () {
        let _this = this
        console.log(_this.result.selected)
      },
      dateChange () {
        let _this = this
        console.log(_this.result.date)
      },
      sendSearch () {
        let _this = this
        _this.checkFn({obj: _this.filterConfig.select, value: _this.result.selected})
        _this.checkFn({obj: _this.filterConfig.date, value: _this.result.date})
        _this.checkFn({obj: _this.filterConfig.search, value: _this.result.searchText})
        _this.$emit('sendSearch', _this.result)
      },
      checkFn ({obj, value}) {
        let _this = this
        if (obj.show && obj.require && isEmpty(value)) {
          _this.$alert(obj.msg, '提示',
            {
              confirmButtonText: '确定',
              callback: action => {
              }
            })
        }
      }
    }
  }

</script>

<style scoped>
  .common-search-bar {
    margin-bottom: 15px;
    display: flex;
  }
  .common-search-item {
    padding: 0 10px

  }
  .common-search-input {
    min-width: 300px;
    max-width: 400px;
  }

</style>
