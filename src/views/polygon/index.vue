<template>
  <div class="bg-img-num1" ref="cropper">
    <el-row>
      <div class="header">
        {{file && file.name}}
      </div>
    </el-row>
    <el-row class="main-container">
      <el-col :span="2" class="tools">
        <el-row class="tool-item">
          打点数：{{currentPolygon && currentPolygon.dots.length > 0 ? currentPolygon.dots.length : 0}}
        </el-row>
        <el-row class="tool-item">
          <label for="file_input" class="el-button el-tooltip item el-button--default">
            选图
            <input type="file" id="file_input"  @change="selectImg" style="position:absolute;clip:rect(0 0 0 0);left: -1000px;top:0;"/>
          </label>
        </el-row>
        <el-row class="tool-item">
          <el-tooltip class="item" effect="dark" content="Shift" placement="right-start">
            <el-button @click="clickEdit">状态</el-button>
          </el-tooltip>
        </el-row>
        <el-row class="tool-item">
          <el-tooltip class="item" effect="dark" content="Ctrl + Space" placement="right-start">
            <el-button @click="finishPolygon">闭合</el-button>
          </el-tooltip>
        </el-row>
        <el-row class="tool-item">
          <el-tooltip class="item" effect="dark" content="Ctrl + Z" placement="right-start">
            <el-button @click="retract">返回</el-button>
          </el-tooltip>
        </el-row>
        <el-row class="tool-item">
          <el-tooltip class="item" effect="dark" content="Ctrl + D" placement="right-start">
            <el-button @click="getJSON">导出</el-button>
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
            <canvas id="canvas-layer" class="canvas" :width="imgBoxW" :height="imgBoxH"></canvas>
            <canvas id="current-canvas-layer" class="canvas" :width="imgBoxW" :height="imgBoxH"></canvas>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
  import {fileTransformDataURL, isImage, getFile, autoDownload, dataTransformJSONDataURL} from 'utils/file'
  class Polygon {
    constructor ({ctx, lineWidth = 2, strokeStyle = 'rgba(255, 113, 98, 1)', fillStyle = 'rgba(79, 205, 66, .5)', dotRadius = 3}) {
      this.ctx = ctx
      this.dotRadius = dotRadius
      this.strokeStyle = strokeStyle
      this.lineWidth = lineWidth
      this.fillStyle = fillStyle
      this.dots = []
      this.startX = ''
      this.startY = ''
      this.lastX = ''
      this.lastY = ''
    }
    startDraw ({x, y}) {
      this.startX = x
      this.startY = y
      this.lastX = x
      this.lastY = y
      this.dots.push({x, y})
      this.ctx.beginPath()
      this.ctx.fillStyle = this.strokeStyle
      this.ctx.lineWidth = 1
      this.ctx.arc(x, y, this.dotRadius, 0, Math.PI * 2)
      this.ctx.fill()
    }
    stroke ({x, y}) {
      this.ctx.beginPath()
      this.ctx.strokeStyle = this.strokeStyle
      this.ctx.lineWidth = this.lineWidth
      this.ctx.moveTo(this.lastX, this.lastY)
      this.ctx.lineTo(x, y)
      this.ctx.stroke()
      this.dots.push({x, y})
      this.lastX = x
      this.lastY = y
    }
    filling () {
      this.ctx.fillStyle = this.fillStyle
      this.ctx.strokeStyle = 'transparent'
      this.ctx.lineWidth = 1
      this.ctx.beginPath()
      this.ctx.moveTo(this.startX, this.startY)
      this.dots.forEach((dot, index) => {
        if (index === 0) return false
        this.ctx.lineTo(dot.x, dot.y)
      })
      this.ctx.closePath()
      this.ctx.fill()
    }
    reStroke () {
      this.dots.pop()
      this.lastX = this.startX
      this.lastY = this.startY
      this.ctx.beginPath()
      this.ctx.fillStyle = this.strokeStyle
      this.ctx.lineWidth = 1
      this.ctx.arc(this.startX, this.startY, this.dotRadius, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.beginPath()
      this.ctx.strokeStyle = this.strokeStyle
      this.ctx.lineWidth = this.lineWidth
      this.ctx.moveTo(this.startX, this.startY)
      this.dots.forEach((dot, index) => {
        if (index === 0) return false
        this.ctx.lineTo(dot.x, dot.y)
      })
      this.ctx.stroke()
      if (this.dots.length > 0) {
        this.lastX = this.dots[this.dots.length - 1].x
        this.lastY = this.dots[this.dots.length - 1].y
      }
    }
  }
  export default {
    name: 'polygon',
    data: () => {
      return {
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
        polygons: [],
        currentPolygon: '',
        canvas: '',
        ctx: '',
        currentCanvas: '',
        currentCtx: '',
        moving: false,
        scale: 1,
        editing: false,
        retractCount: 0,
        img: '',
        file: ''
      }
    },
    components: {},
    beforeCreate () {},
    created () {},
    beforeMount () {},
    mounted () {
      let _this = this
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
        if (e && (e.ctrlKey || e.metaKey) && (e.keyCode === 32 || e.keyCode === 8)) _this.finishPolygon()
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
      initCanvas () {
        this.ctx && this.clearRect()
        this.polygons = []
        this.currentPolygon = ''
        this.scale = 1
      },
      previewImg (e) {
        this.file = getFile({e})
        if (!this.file || !isImage(this.file.ext)) {
          this.$alert('请选择以下图片类型：.gif/jpeg/jpg/png/bmp', '提示')
          return false
        }
        this.img = fileTransformDataURL(this.file.file)
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
      getCanvas () {
        this.canvas = document.getElementById('canvas-layer')
        this.ctx = this.canvas.getContext('2d')
        this.currentCanvas = document.getElementById('current-canvas-layer')
        this.currentCtx = this.currentCanvas.getContext('2d')
      },
      clickEdit () {
        this.editing = !this.editing
      },
      getJSON () {
        let data = []
        this.polygons.forEach((polygon, index) => {
          data.push(polygon.dots)
        })
        let dataURL = dataTransformJSONDataURL(data)
        let filename = '' + this.file.name + '.json'
        autoDownload({dataURL, filename})
      },
      clearRect () {
        this.ctx.clearRect(0, 0, this.imgBoxW, this.imgBoxH)
      },
      createPolygon ({offsetX, offsetY}) {
        this.currentPolygon = new Polygon({ctx: this.ctx})
        this.currentPolygon.startDraw({x: offsetX, y: offsetY})
      },
      drawPolygon ({offsetX, offsetY}) {
        this.currentPolygon.stroke({x: offsetX, y: offsetY})
      },
      finishPolygon () {
        if (this.editing && this.currentPolygon) {
          this.clearRect()
          this.reFill()
          this.currentPolygon.filling()
          this.polygons.push(this.currentPolygon)
          this.currentPolygon = ''
        }
      },
      reFill () {
        this.polygons.forEach((polygon, index) => {
          polygon.filling()
        })
      },
      reStroke () {
        if (this.currentPolygon.dots.length > 0) this.currentPolygon.reStroke()
        else this.currentPolygon = ''
      },
      retract () {
        if (this.editing && this.currentPolygon) {
          this.clearRect()
          this.reFill()
          this.reStroke()
        }
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
          if (this.currentPolygon) {
            this.drawPolygon({offsetX, offsetY})
          } else {
            this.createPolygon({offsetX, offsetY})
          }
        }
      },
      mouseoutTarget (e) {
        if (!this.editing) this.endMove()
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
