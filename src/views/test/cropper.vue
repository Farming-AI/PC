<template>
  <div class="wrapper">
    <div>
      <el-button type="primary" class="file-btn" for="file_input">
        <i class="ali-icon-tianjia"></i> 选择图片
        <input type="file" id="file_input"  @change="uploadImg"/>
      </el-button>
    </div>
    <div class="display-area">
      <vueCropper
        ref="cropper"
        :img="option.img"
        :outputSize="option.size"
        :outputType="option.outputType"
      ></vueCropper>
    </div>
  </div>
</template>
<script>
  import vueCropper from 'vue-cropper'
  export default {
    data: function () {
      return {
        crap: false,
        previews: {},
        lists: [
          {
            img: 'https://fengyuanchen.github.io/cropper/images/picture.jpg'
          },
          {
            img: 'http://ofyaji162.bkt.clouddn.com/touxiang.jpg'
          }
        ],
        option: {
          img: '../../assets/images/1.jpg',
          size: 1,
          outputType: 'jpeg'
        },
        downImg: '#'
      }
    },
    methods: {
      changeImg () {
        this.option.img = this.lists[~~(Math.random() * this.lists.length)].img
      },
      startCrop () {
        // start
        this.crap = true
        this.$refs.cropper.startCrop()
      },
      stopCrop () {
        //  stop
        this.crap = false
        this.$refs.cropper.stopCrop()
      },
      clearCrop () {
        // clear
        this.$refs.cropper.clearCrop()
      },
      // 实时预览函数
      realTime (data) {
/*
        this.previews = data
*/
      },
      finish (type) {
        // 输出
        var test = window.open('about:blank')
        test.document.body.innerHTML = '图片生成中..'
        if (type === 'blob') {
          this.$refs.cropper.getCropBlob((data) => {
            var test = window.open('')
            test.location.href = window.URL.createObjectURL(data)
          })
        } else {
          this.$refs.cropper.getCropData((data) => {
            test.location.href = data
          })
        }
      },

      down (type) {
        // event.preventDefault()
        var aLink = document.createElement('a')
        aLink.download = 'demo'
        // 输出
        if (type === 'blob') {
          this.$refs.cropper.getCropBlob((data) => {
            this.downImg = data
            aLink.href = data
            aLink.click()
          })
        } else {
          this.$refs.cropper.getCropData((data) => {
            this.downImg = data
            aLink.href = data
            aLink.click()
          })
        }
      },

      uploadImg (e) {
        // 上传图片
        // this.option.img
        var file = e.target.files[0]
        if (!/\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG)$/.test(e.target.value)) {
          alert('图片类型必须是.gif,jpeg,jpg,png,bmp中的一种')
          return false
        }
        var reader = new FileReader()
        reader.onload = (e) => {
          this.option.img = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    components: {
      vueCropper: vueCropper
    }
  }
</script>
<style scoped>
  .display-area {
    margin-top: 20px;
    width: 100%;
    height: 700px;
  }
  .img-box {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .mask {
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    background: rgba(0, 0, 0, .6);
  }
  .draw-squareness {
    position: absolute;
    left: 50px;
    top: 60px;
    width: 100px;
    height: 80px;
    border: 1px solid red;
  }
  .file-btn {
    position: relative;
  }
  .file-btn input {
    position: absolute;
    font-size: 100px;
    right: 0;
    top: 0;
    opacity: 0;
  }
</style>
