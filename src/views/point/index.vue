<template>
  <div class="bg-img-num1">
    <el-row>
      <div class="header">
        {{file && file.name}}
      </div>
    </el-row>
    <el-row class="main-container">
      <el-col :span="4" class="tools">
        <el-row class="tool-item">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
            <el-tooltip class="item" effect="dark" content="" placement="top">
              <label for="file_input" class="el-button el-tooltip item el-button--default">
                选图
                <input type="file" id="file_input"  @change="selectImg" style="position:absolute;clip:rect(0 0 0 0);left: -1000px;top:0;"/>
              </label>
            </el-tooltip>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
            <el-tooltip class="item" effect="dark" content="Shift" placement="top">
              <el-button @click="clickEdit">切换</el-button>
            </el-tooltip>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
            <el-tooltip class="item" effect="dark" content="Ctrl + Z" placement="top">
              <el-button @click="retract">返回</el-button>
            </el-tooltip>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
            <el-tooltip class="item" effect="dark" content="Ctrl + D" placement="top">
              <el-button @click="getJSON">导出</el-button>
            </el-tooltip>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
            <label for="josn_input" class="el-button el-tooltip item el-button--default">
              导入JSON文件
              <input type="file" id="josn_input"  @change="selectJSON" style="position:absolute;clip:rect(0 0 0 0);left: -1000px;top:0;"/>
            </label>
          </el-col>

        </el-row>
        <el-row class="tool-item">
          <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="4">
            标记个数：
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="20">
            {{targets.points && targets.points.length > 0 ? targets.points.length : 0}}
          </el-col>
        </el-row>
        <el-row class="tool-item">
          <div style="position: relative">
            <span class="demonstration">设置标记点大小：</span>
          </div>
        </el-row>
        <el-row>
          <div class="block">
            <el-input-number
              v-model="dotRadius"
              @change="sliderChange"
              :min="1"
              :max="20"
              label="半径">
            </el-input-number>
          </div>
        </el-row>
      </el-col>
      <el-col :span="20" class="canvas-c">
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
            <canvas id="canvas-layer" class="canvas" :width="imgBoxW" :height="imgBoxH"></canvas>
          </div>
          <div class="canvas-move"
               @mousedown="mousedownTargetOut"
               @mouseout="mouseoutTarget"
               @mousemove="mousemoveTarget"
               @mouseup="mouseupTarget"
               @mousewheel="scaleImg"
          >
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
  import {formatTime} from 'utils/util'
  import {fileTransformDataURL, isImage, isJSON, getFile, autoDownload, dataTransformJSONDataURL, fileTransformJSON} from 'utils/file'
  class Point {
    constructor ({ctx, fillStyle = 'rgba(255, 113, 98, 1)', dotRadius = 2, x = 0, y = 0}) {
      this.ctx = ctx
      this.dotRadius = dotRadius
      this.fillStyle = fillStyle
      this.x = x
      this.y = y
    }
    draw ({dotRadius = this.dotRadius}) {
      this.dotRadius = dotRadius
      this.ctx.beginPath()
      this.ctx.fillStyle = this.fillStyle
      this.ctx.arc(this.x, this.y, dotRadius, 0, Math.PI * 2)
      this.ctx.fill()
    }
  }
  class PointGroup {
    constructor ({ctx, dotRadius = 2}) {
      this.ctx = ctx
      this.dotRadius = dotRadius
      this.points = []
    }
    reDraw ({dotRadius = this.dotRadius}) {
      this.dotRadius = dotRadius
      this.points.forEach((point, index) => {
        point.draw({x: point.x, y: point.y, dotRadius})
      })
    }
    add ({x, y, dotRadius = this.dotRadius}) {
      this.dotRadius = dotRadius
      let dot = new Point({ctx: this.ctx, dotRadius: this.dotRadius, x, y})
      dot.draw({})
      this.points.push(dot)
      return dot
    }
    del () {
      this.points.length > 0 && this.points.pop()
    }
    clear () {
      this.points = []
    }
  }
  export default {
    name: 'polygon',
    data: () => {
      return {
        dotRadius: 2,
        canvasContainerW: '',
        canvasContainerH: '',
        imgBoxW: 0,
        imgBoxH: 0,
        startX: 0,
        startY: 0,
        x: 0,
        y: 0,
        moveX: 0,
        moveY: 0,
        targets: '',
        currentTarget: '',
        canvas: '',
        ctx: '',
        moving: false,
        scale: 1,
        editing: false,
        img: '',
        file: ''
      }
    },
    components: {},
    beforeCreate () {
    },
    created () {},
    beforeMount () {},
    mounted () {
      let _this = this
      _this.dotRadius = _this.$route.query.dotRadius ? _this.$route.query.dotRadius : 2
      _this.$nextTick(() => {
        _this.canvasContainerW = ~~(window.getComputedStyle(_this.$refs.canvasContainer).width.replace('px', ''))
        _this.canvasContainerH = ~~(window.getComputedStyle(_this.$refs.canvasContainer).height.replace('px', ''))
        _this.getCanvas()
      })
      _this.$refs.bgImg.onload = () => {
        _this.imgBoxW = _this.$refs.bgImg.width
        _this.imgBoxH = _this.$refs.bgImg.height
        if (_this.imgBoxW > _this.canvasContainerW) _this.scale = _this.canvasContainerW / _this.imgBoxW
        if (_this.imgBoxH * _this.scale > _this.canvasContainerH) _this.scale = _this.canvasContainerH / _this.imgBoxH
        _this.x = (_this.canvasContainerW - _this.imgBoxW) / 2
        _this.y = (_this.canvasContainerH - _this.imgBoxH) / 2
      }
      document.onkeydown = function (e) {
        e.preventDefault()
        if (e && (e.ctrlKey || e.metaKey) && e.keyCode === 68) _this.getJSON()
        if (e && (e.ctrlKey || e.metaKey) && e.keyCode === 90) _this.retract()
        if (e && e.key === 'Shift' || e.keyCode === 16) _this.clickEdit()
      }
    },
    beforeUpdate () {},
    updated () {},
    beforeDestroy () {},
    destroyed () {},
    methods: {
      selectImg (e) {
        this.initCanvas()
        this.previewImg(e)
      },
      selectJSON (e) {
        this.file = getFile({e})
        if (!this.file || !isJSON(this.file.ext)) {
          this.$alert('请选择以下JSON文件：.json', '提示')
          return false
        }
        let promise = fileTransformJSON(this.file.file)
        promise.then((result) => {
          let data = JSON.parse(result.target.result)
          if (data.length <= 0) return false
          this.clearRect()
          this.targets.clear()
          data.forEach((dot, index) => {
            this.targets.add({x: dot.x, y: dot.y})
          })
        })
      },
      initCanvas () {
        this.ctx && this.clearRect()
        this.targets = new PointGroup({ctx: this.ctx, dotRadius: this.dotRadius})
        this.currentTarget = ''
        this.scale = 1
        this.dotRadius = 2
      },
      previewImg (e) {
        this.file = getFile({e})
        if (!this.file || !isImage(this.file.ext)) {
          this.$alert('请选择以下图片类型：.gif/jpeg/jpg/png/bmp', '提示')
          return false
        }
        this.img = fileTransformDataURL(this.file.file)
      },
      getCanvas () {
        this.canvas = document.getElementById('canvas-layer')
        this.ctx = this.canvas.getContext('2d')
      },
      clickEdit () {
        this.editing = !this.editing
      },
      getJSON () {
        let points = []
        this.targets.points.forEach((point, index) => {
          points.push({x: point.x, y: point.y})
        })
        if (points.length < 0 || !this.file) {
          this.$alert('暂无标注数据，请先标注', '提示')
          return false
        }
        let dataURL = dataTransformJSONDataURL(points)
        let filename = '' + this.file.name + '_' + formatTime().format('yyyyMMdd') + '.json'
        autoDownload({dataURL, filename})
      },
      retract () {
        if (this.editing && this.currentTarget) {
          this.clearRect()
          this.targets.del()
          this.targets.reDraw({})
        }
      },
      clearRect () {
        this.ctx.clearRect(0, 0, this.imgBoxW, this.imgBoxH)
      },
      sliderChange (value) {
        this.dotRadius = value
        if (!this.targets || this.targets.points.length <= 0) {
          return false
        }
        this.clearRect()
        this.targets.reDraw({dotRadius: value})
      },
      mousedownTarget (e) {
        e.preventDefault()
        let offsetX = e.offsetX
        let offsetY = e.offsetY
        if (!this.editing) {
          let startX = e.clientX
          let startY = e.clientY
          this.startMove(startX, startY)
        } else {
          if (!this.targets || this.targets.points.length <= 0) {
            this.targets = new PointGroup({ctx: this.ctx, dotRadius: this.dotRadius})
          }
          this.currentTarget = this.targets.add({x: offsetX, y: offsetY})
        }
      },
      mousedownTargetOut (e) {
        e.preventDefault()
        let startX = e.clientX
        let startY = e.clientY
        this.startMove(startX, startY)
      },
      mouseoutTarget (e) {
        this.endMove()
      },
      mousemoveTarget (e) {
        e.preventDefault()
        let nowX = e.clientX
        let nowY = e.clientY
        this.move(nowX, nowY, this)
      },
      mouseupTarget (e) {
        this.endMove()
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
<style>
  .el-slider__bar, .el-slider__button, .el-slider__button.hover, .el-slider__button.dragging {
    background-color: rgba(255, 113, 98, 1);
  }
</style>
<style scoped>
  .header {
    height: 50px;
    line-height: 50px;
    padding: 0 20px;
  }
  .main-container {
    font-size: 14px;
    width: 100%;
    height: calc(100% - 50px);
  }

  .tools {
    padding: 0 10px;
    height: 100%;
  }
  .tool-item {
    margin: 10px 0;
  }
  .tool-item .el-button {
    margin-bottom: 10px;
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
  .canvas-move {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }
  .canvas-actual-layer {
    position: relative;
    z-index: 2;
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
