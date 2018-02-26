/**
* Created by newlmy on 2017/8/28.
*/
<template>
  <div>
    <el-dialog :title="dialog.title" :visible.sync="dialog.show" :modal="dialog.modal" :size="dialog.size" :modal-append-to-body="false" :close-on-click-modal="false">
      <button type="button" class="el-dialog__headerbtn el-dialog__cover" @click="cover">
        <i class="el-dialog__close ali-icon" :class="dialog.size === 'full' ? 'ali-icon-tuichuquanping' : 'ali-icon-quanping'"></i>
      </button>
      <slot name="dialogContent"></slot>
      <div slot="footer" class="dialog-footer" v-if="dialog.isFooter">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="confirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    name: 'dialog',
    props: {
      dialog: {
        type: Object,
        default () {
          return {
            key: '',
            title: '提示',
            show: false,
            isFooter: true,
            modal: false,
            size: 'small'
          }
        }
      }
    },
    data () {
      return {
        isFull: false,
        initDialog: {}
      }
    },
    created () {
      let _this = this
      _this.initDialog = JSON.parse(JSON.stringify(_this.dialog))
    },
    watch: {
      'dialog.show': function (val, oldVal) {
        let _this = this
        if (!val)_this.$emit('cancel', _this.dialog)
      }
    },
    methods: {
      cancel () {
        let _this = this
        _this.dialog.show = !_this.dialog.show
        _this.dialog.size = _this.initDialog.size
      },
      confirm () {
        let _this = this
        _this.dialog.size = _this.initDialog.size
        _this.$emit('confirm', _this.dialog)
      },
      cover () {
        let _this = this
        if (_this.dialog.size === 'full') _this.dialog.size = _this.initDialog.size
        else _this.dialog.size = 'full'
      }
    }
  }

</script>

<style scoped>
  .el-dialog__cover {
    position: absolute;
    top: 20px;
    right: 43px;
  }
</style>
