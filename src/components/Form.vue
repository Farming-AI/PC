/**
* Created by newlmy on 2017/9/3.
*/

<template>
  <div>
    <div class="form-title" v-if="!!title">{{title}}</div>
    <el-form ref="form" :model="form" :rules="rules" :label-position="labelPosition" label-width="80px">
      <el-form-item  v-for="(item, index) in formData" :key="index" :label="item.label" :prop="item.required ? item.key : ''">
        <template v-if="item.type=='input'">
          <el-input v-model="item.value" :placeholder="item.placeholder" @change="changeFn(item)"></el-input>
        </template>
        <template v-if="item.type=='password'">
          <el-input type="password" v-model="item.value" :placeholder="item.placeholder" @change="changeFn(item)"></el-input>
        </template>
        <template v-else-if="item.type=='select'">
          <el-select v-model="item.value" :placeholder="item.placeholder" @change="changeFn(item)">
            <el-option v-for="(option, i) in item.options" :key="option.value" :label="option.label" :value="option.value"></el-option>
          </el-select>
        </template>
        <template v-else-if="item.type=='date'">
          <el-date-picker :type="item.type" :placeholder="item.placeholder" v-model="item.value" style="width: 100%;" @change="changeFn(item)"></el-date-picker>
        </template>
        <template v-else-if="item.type=='fixed-time'">
          <el-time-picker :type="item.type" :placeholder="item.placeholder" v-model="item.value" style="width: 100%;" @change="changeFn(item)"></el-time-picker>
        </template>
        <template v-else-if="item.type=='switch'">
          <el-switch on-text="" off-text="" v-model="item.value"></el-switch>
        </template>
        <template v-else-if="item.type=='checkbox'">
          <el-checkbox-group v-model="item.value" @change="changeFn(item)">
            <el-checkbox v-for="(c, i) in item.checkboxs" :key="i" :label="c.value" :disabled="c.disabled ? c.disabled : false">{{c.label}}</el-checkbox>
          </el-checkbox-group>
        </template>
        <template v-else-if="item.type=='radio'">
          <el-radio-group v-model="item.value" @change="changeFn(item)">
            <el-radio v-for="(r, i) in item.radios" :key="i" :label="r.value" :disabled="r.disabled ? r.disabled : false">{{r.label}}</el-radio>
          </el-radio-group>
        </template>
        <template v-else-if="item.type=='textarea'">
          <el-input :type="item.type" v-model="item.value" :placeholder="item.placeholder" @change="changeFn(item)"></el-input>
        </template>
        <template v-else-if="item.type == 'remark'">
          <div class="form-remark">
            <el-row :gutter="5" justify="space-between">
              <el-col v-for="(remark, remarkIndex) in item.list" :key="remarkIndex" :span="Math.floor(24/item.list.length)< 8 ? 8 : Math.floor(24/item.list.length)">
                <template v-if="remark.type == 'link'">
                  <router-link :to="remark.to">{{remark.text}}</router-link>
                </template>
                <template v-else-if="remark.type == 'checkbox'">
                  <el-checkbox-group v-model="remark.value" @change="changeFn(remark)">
                    <el-checkbox v-for="(c, i) in remark.checkboxs" :key="i" :label="c.value" :disabled="c.disabled ? c.disabled : false">{{c.label}}</el-checkbox>
                  </el-checkbox-group>
                </template>
              </el-col>
            </el-row>
          </div>
        </template>
        <template  v-else-if="item.type=='button'">
          <el-button :size="item.size"  :class="{'button-cover': item.isBlock}" type="primary" @click="submitForm">{{item.text}}</el-button>
        </template>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {
    name: 'form',
    props: {
      title: String,
      formData: Array,
      rules: Object,
      labelPosition: {
        type: String,
        default: 'left'
      }
    },
    data () {
      return {
        form: {}
      }
    },
    methods: {
      submitForm () {
        let _this = this
        _this.getFormValue()
        this.$refs.form.validate((valid) => {
          if (valid) {
            _this.$emit('submitForm', _this.form)
          } else {
            return false
          }
        })
      },
      changeFn (item) {
        let _this = this
        _this.$set(_this.form, item.key, item.value)
      },
      getFormValue () {
        let _this = this
        _this.formData.forEach(function (item, index) {
          if (item.type === 'button') return
          if (_this.form[item.key]) return
          _this.$set(_this.form, item.key, item.value)
        })
      }
    },
    watch: {
    },
    mounted () {
    }
  }

</script>
<style>
  .form-remark {
    margin-top: -18px;
    font-size: 12px;
  }
  .form-remark a {
    color: #1D8CE0;
    font-size: 12px;

  }
  .form-remark .el-checkbox-group {
    text-align: right;
  }
  .form-remark .el-checkbox__label {
    font-size: 12px;
  }

</style>
<style scoped>
  .form-title {
    text-align: center;
    line-height: 50px;
    height: 50px;
    font-size: 18px;
    color: #444;
  }
  .button-cover {
    display: block;
    width: 100%;
  }

</style>
