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
            <el-button @click="selectEdit">状态</el-button>
          </el-tooltip>
        </el-row>
        <el-row class="tool-item">
          <el-tooltip class="item" effect="dark" content="Ctrl + Z" placement="right-start">
            <el-button @click="reback">撤销</el-button>
          </el-tooltip>
        </el-row>
        <el-row class="tool-item">
          <el-tooltip class="item" effect="dark" placement="right-start">
            <el-button @click="allClear">清除</el-button>
          </el-tooltip>
        </el-row>
        <el-row class="tool-item">
          <label for="json_input" class="el-button el-tooltip item el-button--default">
            导入
            <input type="file" id="json_input"  @change="selectJSON" style="position:absolute;clip:rect(0 0 0 0);left: -1000px;top:0;"/>
          </label>
        </el-row>
        <el-row class="tool-item">
          <el-tooltip class="item" effect="dark" content="Ctrl + D" placement="right-start">
            <el-button @click="getJSON">导出</el-button>
          </el-tooltip>
        </el-row>
      </el-col>
      <el-col :span="22" class="canvas-c">
        <div class="paint-tool-main" ref="paintToolMain"
         @mousemove="painting"
         @mouseup="stopPaint"
        >
          <div
            class="paint-box"
            :style="{
                'width': canvas.w + 'px',
                'height': canvas.h + 'px',
                'transform': 'scale(' + canvas.scale + ',' + canvas.scale + ') ' + 'translate3d('+ canvas.x / canvas.scale + 'px,' + canvas.y / canvas.scale + 'px,' + '0)'
                }"
            @mousedown="startPaint"
            @mousemove="painting"
            @mouseup="stopPaint"
          >
            <div class="paint-box-img">
              <img :src="canvas.img" alt="" style="display:block" ref="img">
            </div>
            <svg
              id="svg"
              style = "position: absolute;top: 0;left: 0;cursor: crosshair"
              :style="{
                  'width': canvas.w + 'px',
                  'height': canvas.h + 'px'
                }"
            >
            </svg>
          </div>
          <div class="paint-box-move-layer"
               :class="{'cursor-move': !canvas.editing, 'paint-box-move-layer-hide': canvas.editing}"
               @mousedown="mousedownTarget"
               @mousemove="mousemoveTarget"
               @mouseout="mouseoutTarget"
               @mouseup="mouseupTarget"
               @mousewheel="scaleImg"
          ></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
  import SVG from 'svg.js'
  import {formatTime} from 'utils/util'
  import {getFile, isImage, isJSON, fileTransformDataURL, fileTransformJSON, dataTransformJSONDataURL, autoDownload} from 'utils/file'
  class Canvas {
    constructor ({x = 0, y = 0, w = 0, h = 0, scale = 1, active = false, editing = false, img}) {
      this.x = x
      this.y = y
      this.w = w
      this.h = h
      this.scale = scale
      this.active = active
      this.editing = editing
      this.img = img
    }
    setImg ({img}) {
      this.img = img
    }
    setSize ({w, h}) {
      this.w = w
      this.h = h
    }
    setScale ({scale}) {
      this.scale = scale
    }
    setActive ({active}) {
      this.active = active
    }
    setEdit ({editing}) {
      this.editing = editing
    }
    draging ({x, y}) {
      this.x += x
      this.y += y
    }
    scaling ({change}) {
      let coe = 0.2
      coe = Math.min(coe / this.w, coe / this.h)
      let num = coe * change
      num < 0 ? this.scale += Math.abs(num) : this.scale > Math.abs(num) ? this.scale -= Math.abs(num) : this.scale
    }
  }
  class Circle {
    constructor ({svg, centerX, centerY, radius = 0, color = '#f06', width = '2px', active = false}) {
      this.svg = svg
      this.centerX = centerX
      this.centerY = centerY
      this.radius = radius
      this.x = centerX - radius
      this.y = centerY - radius
      this.diameter = radius * 2
      this.color = color
      this.width = width
      this.active = active
      this.circle = svg.circle(this.diameter).fill('none').stroke({color, width}).move(this.x, this.y)
    }
    setActive ({active}) {
      this.active = active
    }
    setRadius ({radius}) {
      this.radius = radius
      this.diameter = radius * 2
      this.circle.radius(radius)
    }
    del () {
      this.circle.remove()
    }
  }
  export default {
    name: 'Tool',
    data: () => {
      return {
        file: {
          file: '',
          name: '',
          ext: ''
        },
        paintToolMainW: 0,
        paintToolMainH: 0,
        canvas: {
          x: 0,
          y: 0,
          w: 0,
          h: 0,
          scale: 1,
          active: false,
          editing: false,
          img: ''
        },
        mouse: {
          startX: 0,
          startY: 0,
          moveX: 0,
          moveY: 0
        },
        polygonMouse: {
          startClientX: 0,
          startClientY: 0,
          startOffsetX: 0,
          startOffsetY: 0,
          moveX: 0,
          moveY: 0
        },
        draw: null,
        currentCircle: null,
        circles: []
      }
    },
    components: {},
    beforeCreate () {},
    created () {},
    beforeMount () {},
    mounted () {
      this.$nextTick(() => {
        this.paintToolMainW = ~~(window.getComputedStyle(this.$refs.paintToolMain).width.replace('px', ''))
        this.paintToolMainH = ~~(window.getComputedStyle(this.$refs.paintToolMain).height.replace('px', ''))
        this.canvas = new Canvas({})
        this.draw = SVG('svg')
      })
      this.$refs.img.onload = () => {
        this.canvas.setSize({w: this.$refs.img.width, h: this.$refs.img.height})
        if (this.canvas.w > this.paintToolMainW) this.canvas.setScale({scale: this.paintToolMainW / this.canvas.w})
        if (this.canvas.h * this.canvas.scale > this.paintToolMainH) this.canvas.setScale({scale: this.paintToolMainH / this.canvas.h})
        this.canvas.x = (this.paintToolMainW - this.canvas.w) / 2
        this.canvas.y = (this.paintToolMainH - this.canvas.h) / 2
      }
      document.onkeydown = (e) => {
        e.preventDefault()
        if (e && (e.ctrlKey || e.metaKey) && e.keyCode === 68) this.getJSON()
        if (e && (e.ctrlKey || e.metaKey) && e.keyCode === 90) this.reback()
        if (e && e.key === 'Shift' || e.keyCode === 16) this.selectEdit()
      }
    },
    beforeUpdate () {},
    updated () {},
    beforeDestroy () {},
    destroyed () {},
    methods: {
      initCanvas () {
        this.circles = []
        this.canvas.scale = 1
        this.draw && this.draw.clear()
      },
      previewImg (e) {
        this.file = getFile({e})
        if (!this.file || !isImage(this.file.ext)) {
          this.$alert('请选择以下图片类型：.gif/jpeg/jpg/png/bmp', '提示')
          return false
        }
        this.canvas.setImg({img: fileTransformDataURL(this.file.file)})
      },
      selectImg (e) {
        if (e.target.files.length <= 0) return false
        this.initCanvas()
        this.previewImg(e)
      },
      scaleImg (e) {
        let change = e.deltaY || e.wheelDelta
        this.canvas.scaling({change})
      },
      selectEdit () {
        this.canvas.setEdit({editing: !this.canvas.editing})
      },
      allClear () {
        this.draw && this.draw.clear()
        this.circles = []
      },
      reback () {
        if (this.circles.length <= 0) return false
        let circle = this.circles.pop()
        circle.del()
      },
      getJSON () {
        let datas = []
        this.circles.forEach((circle, index) => {
          datas.push({x: circle.centerX, y: circle.centerY, radius: circle.radius})
        })
        if (datas.length < 0 || !this.file) {
          this.$alert('暂无标注数据，请先标注', '提示')
          return false
        }
        let dataURL = dataTransformJSONDataURL(datas)
        let filename = '' + this.file.name + '_' + formatTime().format('yyyyMMdd') + '.json'
        autoDownload({dataURL, filename})
      },
      selectJSON (e) {
        let file = getFile({e})
        if (!file || !isJSON(file.ext)) {
          this.$alert('请选择以下JSON文件：.json', '提示')
          return false
        }
        let promise = fileTransformJSON(file.file)
        promise.then((result) => {
          let data = JSON.parse(result.target.result)
          if (data.length <= 0) return false
          this.allClear()
          data.forEach((circle, index) => {
            let c = new Circle({svg: this.draw, centerX: circle.x, centerY: circle.y, radius: circle.radius})
            this.circles.push(c)
          })
        })
      },
      startPaint (e) {
        if (this.currentCircle) {
          this.stopPaint()
          return
        }
        e.preventDefault()
        this.polygonMouse.startOffsetX = e.offsetX
        this.polygonMouse.startOffsetY = e.offsetY
        this.polygonMouse.startClientX = e.clientX
        this.polygonMouse.startClientY = e.clientY
        this.polygonMouse.defaultClientX = e.clientX
        this.polygonMouse.defaultClientY = e.clientY
        this.currentCircle = new Circle({svg: this.draw, centerX: this.polygonMouse.startOffsetX, centerY: this.polygonMouse.startOffsetY})
        this.currentCircle.setActive({active: true})
      },
      painting (e) {
        if (this.currentCircle == null || !this.currentCircle.active) return false
        e.preventDefault()
        let nowClientX = e.clientX
        let fw = ~~(nowClientX - this.polygonMouse.startClientX)
        let distance = nowClientX - this.polygonMouse.defaultClientX
        if (distance > 5) {
          this.currentCircle.setRadius({radius: this.currentCircle.radius + fw})
        } else if (distance >= -5 && distance <= 0) {
          this.currentCircle.setRadius({radius: 0})
        } else if (distance <= 5 && distance > 0) {
          this.currentCircle.setRadius({radius: 0})
        } else {
          this.currentCircle.setRadius({radius: this.currentCircle.radius - fw})
        }
        this.polygonMouse.startClientX = nowClientX
        this.currentCircle.circle.on('click', function () {
        })
      },
      stopPaint (e) {
        if (this.currentCircle) {
          if (this.currentCircle.radius > 0) this.circles.push(this.currentCircle)
          this.currentCircle.setActive({active: false})
          this.currentCircle = null
        } else {
          return false
        }
      },
      mousedownTarget (e) {
        e.preventDefault()
        this.canvas.setActive({active: true})
        this.mouse.startX = e.clientX
        this.mouse.startY = e.clientY
      },
      mousemoveTarget (e) {
        if (!this.canvas.active) return false
        e.preventDefault()
        this.mouse.moveX = ~~(e.clientX - this.mouse.startX)
        this.mouse.moveY = ~~(e.clientY - this.mouse.startY)
        this.mouse.startX = e.clientX
        this.mouse.startY = e.clientY
        this.canvas.draging({x: this.mouse.moveX, y: this.mouse.moveY})
      },
      mouseupTarget (e) {
        this.canvas.setActive({active: false})
      },
      mouseoutTarget (e) {
        this.canvas.setActive({active: false})
      }
    }
  }
</script>
<style scoped>
  .paint-tool-main {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: hidden;
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC');
  }
  .paint-box-move-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .paint-box-move-layer-hide {
    display: none;
  }
  .paint-box {
  }
  .paint-box-img {

  }
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
