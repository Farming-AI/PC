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
      </el-col>
      <el-col :span="22" class="canvas-c">
        <div class="canvas-container" ref="canvasContainer"
          @mousedown="mousedownTarget"
          @mouseout="mouseoutTarget"
          @mousemove="mousemoveTarget"
          @mouseup="mouseupTarget"
        >
          <div
            class="canvas-actual-layer"
            :class="{'cursor-move': !editing}"
            :style="{
                'width': imgBoxW + 'px',
                'height': imgBoxH + 'px',
                'transform': 'scale(' + scale + ',' + scale + ') ' + 'translate3d('+ x / scale + 'px,' + y / scale + 'px,' + '0)'
                }"
            @mousewheel="scaleImg"
          >
            <div class="canvas-bg-layer">
              <img :src="img" alt="" style="display:block" ref="bgImg">
            </div>
            <canvas ref="displayCanvas" id="canvas-layer" class="canvas" :width="imgBoxW" :height="imgBoxH"></canvas>
            <canvas v-show="editing" ref="paintCanvas" id="current-canvas-layer" class="canvas current-canvas" :width="imgBoxW" :height="imgBoxH" style="border: 1px solid red"
              @mousewheel="scaleImg"
              @mousedown="mousedownPaint"
              @mouseout="mouseoutPaint"
              @mousemove="mousemovePaint"
              @mouseup="mouseupPaint"
            ></canvas>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
  import {Curve, isPointInCurveArea, drawCurvePath} from 'utils/curve'
  import {fileTransformDataURL, isImage, getFile, autoDownload, dataTransformJSONDataURL} from 'utils/file'
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
        moving: false,
        scale: 1,
        editing: false,
        img: '',
        file: '',
        polygons: [],
        paintCanvas: {
          isPaint: true,
          isClosePath: true,
          curve: null
        },
        displayCanvas: ''
      }
    },
    components: {},
    beforeCreate () {},
    created () {},
    beforeMount () {},
    mounted () {
      this.$nextTick(() => {
        this.canvasContainerW = ~~(window.getComputedStyle(this.$refs.canvasContainer).width.replace('px', ''))
        this.canvasContainerH = ~~(window.getComputedStyle(this.$refs.canvasContainer).height.replace('px', ''))
        this.getCanvas()
      })
      this.$refs.bgImg.onload = () => {
        this.getImgPosition()
      }
      let _this = this
      document.onkeydown = function (e) {
        e.preventDefault()
        if (e && (e.ctrlKey || e.metaKey) && (e.keyCode === 32 || e.keyCode === 8)) {
          if (_this.paintCanvas.isClosePath) {
            _this.paintCanvas.curve.closePath()
          }
          _this.paintCanvas.isPaint = false
          _this.paintCanvas.isClosePath = false
        }
        if (e && (e.ctrlKey || e.metaKey) && e.keyCode === 68) _this.getJSON()
        if (e && (e.ctrlKey || e.metaKey) && e.keyCode === 90) _this.currentDrawing.withDraw()
        if (e && e.key === 'Shift' || e.keyCode === 16) _this.clickEdit()
      }
    },
    beforeUpdate () {},
    updated () {},
    beforeDestroy () {},
    destroyed () {},
    methods: {
      getImgPosition () {
        this.imgBoxW = this.$refs.bgImg.width
        this.imgBoxH = this.$refs.bgImg.height
        if (this.imgBoxW > this.canvasContainerW) this.scale = this.canvasContainerW / this.imgBoxW
        if (this.imgBoxH * this.scale > this.canvasContainerH) this.scale = this.canvasContainerH / this.imgBoxH
        this.x = (this.canvasContainerW - this.imgBoxW) / 2
        this.y = (this.canvasContainerH - this.imgBoxH) / 2
      },
      ctrlDeleteToFill (e) {
      },
      selectImg (e) {
        this.initCanvas()
        this.previewImg(e)
      },
      initCanvas () {
        this.paintCanvas.curve && this.clearRect()
        this.polygons = []
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
        this.displayCanvas = document.getElementById('canvas-layer').getContext('2d')
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
      },
      clickEdit () {
        this.editing = !this.editing
        if (this.editing) this.createCurrentCanvas()
      },
      createCurrentCanvas () {
        if (!this.paintCanvas.curve) {
          this.paintCanvas.curve = new Curve({
            el: this.$refs.paintCanvas
          })
        }
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
        this.paintCanvas.curve.empty()
      },
      mousedownTarget (e) {
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
      mousedownPaint (e) {
        if (this.paintCanvas.isPaint) {
          this.paintCanvas.curve.curveMouseDown(e)
        } else {
          let x = e.offsetX
          let y = e.offsetY
          let clickIndex = -1
          if (this.paintCanvas.curve.isPointInCurveArea([x, y])) {
            this.paintCanvas.isPaint = true
            this.paintCanvas.curve.curveMouseDown(e)
          } else {
            this.polygons.forEach((item, index) => {
              if (isPointInCurveArea([x, y], item, this.displayCanvas)) clickIndex = index
            })
            if (clickIndex >= 0) {
              this.paintCanvas.curve.replace(this.polygons[clickIndex])
              this.paintCanvas.isClosePath = false
              this.paintCanvas.isPaint = true
              this.displayCanvas.clearRect(0, 0, this.imgBoxW, this.imgBoxW)
              this.polygons.splice(clickIndex, 1)
              this.polygons.forEach((item, index) => {
                drawCurvePath(item, this.displayCanvas)
              })
              this.paintCanvas.curve.curveMouseDown(e)
            } else {
              let arr = this.paintCanvas.curve.getPointList()
              this.paintCanvas.isClosePath = true
              this.paintCanvas.isPaint = true
              if (arr.length > 0) {
                this.polygons.push(arr)
                this.displayCanvas.clearRect(0, 0, this.imgBoxW, this.imgBoxW)
                this.polygons.forEach((item, index) => {
                  drawCurvePath(item, this.displayCanvas)
                })
              }
              this.paintCanvas.curve.clear()
              this.paintCanvas.curve.curveMouseDown(e)
            }
          }
        }
        e.stopPropagation()
      },
      mouseoutPaint (e) {
      },
      mousemovePaint (e) {
        if (this.paintCanvas.isPaint) {
          this.paintCanvas.curve.curveMouseMove(e)
        }
        e.stopPropagation()
      },
      mouseupPaint (e) {
        if (this.paintCanvas.isPaint) {
          this.paintCanvas.curve.curveMouseUp(e)
        }
        e.stopPropagation()
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
    cursor: move;
  }
  .canvas-actual-layer {
    position: absolute;
  }
  .current-canvas {
    cursor: pointer;
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
