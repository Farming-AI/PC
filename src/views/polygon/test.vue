/**
* Created by newlmy on 2017/12/6.
*/

<template>
  <div class="bg-img-num1" ref="cropper">
    <el-row>
      <div class="header">
      </div>
    </el-row>
    <el-row class="main-container">
      <el-col :span="2" class="tools">
        <el-row class="tool-item">
          打点数：0
        </el-row>
        <el-row class="tool-item">
          <label for="file_input" class="el-button el-tooltip item el-button--default">
            选图
            <input type="file" id="file_input"  @change="selectImg" style="position:absolute;clip:rect(0 0 0 0);left: -1000px;top:0;"/>
          </label>
        </el-row>
        <el-row class="tool-item">
          <el-tooltip class="item" effect="dark" content="Shift" placement="right-start">
            <el-button>状态</el-button>
          </el-tooltip>
        </el-row>
        <el-row class="tool-item">
          <el-tooltip class="item" effect="dark" content="Ctrl + Space" placement="right-start">
            <el-button>闭合</el-button>
          </el-tooltip>
        </el-row>
        <el-row class="tool-item">
          <el-tooltip class="item" effect="dark" content="Ctrl + Z" placement="right-start">
            <el-button>返回</el-button>
          </el-tooltip>
        </el-row>
        <el-row class="tool-item">
          <el-tooltip class="item" effect="dark" content="Ctrl + D" placement="right-start">
            <el-button>导出</el-button>
          </el-tooltip>
        </el-row>
      </el-col>
      <el-col :span="22" class="canvas-c">
        <div class="canvas-container" ref="canvasContainer">
          <div
            class="canvas-actual-layer"
            :class="{'cursor-move': !editing}"
            :style="{
                'width': imgBoxW + 'px',
                'height': imgBoxH + 'px',
                'transform': 'scale(' + scale + ',' + scale + ') ' + 'translate3d('+ x / scale + 'px,' + y / scale + 'px,' + '0)'
                }"
            @mousedown="mousedownTarget"
            @mouseout="mouseoutTarget"
            @mousemove="mousemoveTarget"
            @mouseup="mouseupTarget"
            @mousewheel="scaleImg"
          >
            <div class="canvas-bg-layer">
              <img :src="img" alt="" style="display:block" ref="bgImg">
            </div>
            <div id="svg"></div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import {fileTransformDataURL, isImage, getFile} from 'utils/file'
  export default {
    name: 'test',
    data: () => {
      return {
        svg: {
          editing: true,
          imgBoxW: 0,
          imgBoxH: 0,
          scale: 1,
          x: 0,
          y: 0,
          img: ''
        }
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
      initCanvas () {
      },
      previewImg (e) {
        this.file = getFile({e})
        if (!this.file || !isImage(this.file.ext)) {
          this.$alert('请选择以下图片类型：.gif/jpeg/jpg/png/bmp', '提示')
          return false
        }
        this.svg.img = fileTransformDataURL(this.file.file)
      },
      getCanvas () {
      },
      mousedownTarget (e) {
        e.preventDefault()
      },
      mouseoutTarget (e) {
      },
      mousemoveTarget (e) {
      },
      mouseupTarget (e) {
      },
      scaleImg (e) {
        let change = e.deltaY || e.wheelDelta
        this.changeSize({change})
      },
      changeSize ({change}) {
        let coe = 0.2
        coe = coe / this.imgBoxW > coe / this.imgBoxH ? coe / this.imgBoxH : coe / this.imgBoxW
        let num = coe * change
        num < 0 ? this.scale += Math.abs(num) : this.scale > Math.abs(num) ? this.scale -= Math.abs(num) : this.scale
      },
      startMove (startX, startY) {
        this.moving = true
        this.moveX = startX - this.x
        this.moveY = startY - this.y
      },
      move (nowX, nowY, vue) {
        this.moving && vue.$nextTick(() => {
          this.x = ~~(nowX - this.moveX)
          this.y = ~~(nowY - this.moveY)
        })
      },
      endMove () {
        this.moving = false
      }
    }
  }
</script>

<style scoped>
  .header {
    height: 50px;
    line-height: 50px;
    padding: 0 20px;
  }
  .main-container {
    width: 100%;
    height: calc(100% - 50px);
  }

  .tools {
    padding: 0 10px;
    height: 100%;
  }
  .tool-item {
    height: 40px;
  }
  .canvas-c {
    height: 100%;
    position: relative;
  }
  .bg-img-num1 {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    color: rgba(255,255,255,0.65);
    background-color: #24292e;
    background-image: url(../../assets/images/star-bg.svg),linear-gradient(#191c20, #24292e 15%);
    background-repeat: repeat-x;
    background-position: center 0, 0 0, 0 0;
  }
  .canvas-container {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    overflow: hidden;
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC');
  }
  .canvas-actual-layer {
    position: relative;
  }
  .canvas {
    position: absolute;
    top: 0;
    left: 0;
  }
  .cursor-move {
    cursor: move;
  }
  .img-draw {
    cursor: crosshair;
  }
  #ui-layer {
    z-index: 3;
  }
</style>
