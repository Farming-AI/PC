<template>
  <div class="page">
    <div>
      <label for="file_input" class="el-button el-button--primary">
        选图
        <input type="file" id="file_input"  @change="selectImg" style="position:absolute;clip:rect(0 0 0 0);left: -1000px;top:0;"/>
      </label>
    </div>
    <div class="test-data-area">
      <el-row>
        <el-col :span="2">
          提交测试图片：
        </el-col>
        <el-col :span="22">
          <img :src="img" alt="" style="display:block;width: 200px; height: 200px;" ref="bgImg">
        </el-col>
      </el-row>
    </div>
    <div class="test-data-area">
      <el-row>
        <el-col :span="2">
          测试结果：
        </el-col>
        <el-col :span="22">
          <el-row :gutter="20">
            <el-col :span="4" class="result-item" v-for="result in results">
              <img :src="result.url" alt="" class="result-img">
              <span class="result-text">{{result.name}}：{{result.score}}</span>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
  import axios from 'axios'
  import {fileTransformDataURL, isImage, getFile} from 'utils/file'
  export default {
    name: 'result',
    data: () => {
      return {
        img: '',
        file: '',
        results: []
      }
    },
    components: {},
    beforeCreate () {},
    created () {},
    beforeMount () {},
    mounted () {
    },
    beforeUpdate () {},
    updated () {},
    beforeDestroy () {},
    destroyed () {},
    methods: {
      selectImg (e) {
        this.previewImg(e)
      },
      previewImg (e) {
        let _this = this
        this.file = getFile({e})
        if (!this.file || !isImage(this.file.ext)) {
          this.$alert('请选择以下图片类型：.gif/jpeg/jpg/png/bmp', '提示')
          return false
        }
        this.img = fileTransformDataURL(this.file.file)
        let formdata = new FormData()
        formdata.append('file', this.file.file)
        axios.post('http://192.168.10.117:93/app/add_image', formdata).then((response) => {
          console.log(234)
          _this.results = response.data.data
        }).catch((error) => {
          console.log(error)
        })
      }
    }
  }
</script>
<style scoped>
  .page {
    padding: 10px 20px;
  }
  .test-data-area {
    padding: 10px 0;
  }
  .result-item {
    position: relative;
  }
  .result-img {
    width: 100%;
    display: block;
  }
  .result-text {
    position: absolute;
    top: 0;
    left: 10px;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.5);
    width: calc(100% - 20px);
    line-height: 30px;
    padding: 0 5px

  }
</style>
