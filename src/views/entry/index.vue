/**
* Created by newlmy on 2017/11/23.
*/

<template>
  <el-container class="paint-tool">
    <el-header>Header</el-header>
    <el-container>
      <el-aside width="80px">
        <label for="file_input" class="el-button el-tooltip item el-button--default">
          选图
          <input type="file" id="file_input"  @change="selectImg" style="position:absolute;clip:rect(0 0 0 0);left: -1000px;top:0;"/>
        </label>
        <el-button @click="selectEdit">切换</el-button>
      </el-aside>
      <el-container>
        <el-main>
          <div class="paint-tool-main" ref="paintToolMain">
            <div
              class="paint-box"
              :style="{
                'width': canvas.w + 'px',
                'height': canvas.h + 'px',
                'transform': 'scale(' + canvas.scale + ',' + canvas.scale + ') ' + 'translate3d('+ canvas.x / canvas.scale + 'px,' + canvas.y / canvas.scale + 'px,' + '0)'
                }"
            >
              <div class="paint-box-img">
                <img :src="canvas.img" alt="" style="display:block" ref="img">
              </div>
              <svg
                id="svg"
                style = "border: 3px solid red; position: absolute;top: 0;left: 0;"
                :style="{
                  'width': canvas.w + 'px',
                  'height': canvas.h + 'px'
                }"
                @mousedown="startPaint"
                @mousemove="painting"
                @mouseup="stopPaint"
              >
              </svg>
            </div>
            <div class="paint-box-move-layer"
                 :class="{'cursor-move': canvas.active, 'paint-box-move-layer-hide': canvas.editing}"
                 @mousedown="mousedownTarget"
                 @mousemove="mousemoveTarget"
                 @mouseout="mouseoutTarget"
                 @mouseup="mouseupTarget"
                 @mousewheel="scaleImg"
            ></div>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>
<script>
  import SVG from 'svg.js'
  import {getFile, isImage, fileTransformDataURL} from 'utils/file'
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
    constructor ({svg, x, y, radius = 2, color = '#f06', width = '2px', active = false, dragPositionX = 'right', dragPositionY = 'bottom', ableChangeX = true, ableChangeY = true}) {
      this.svg = svg
      this.radius = radius
      this.x = x
      this.y = y
      this.color = color
      this.width = width
      this.active = active
      this.dragPositionX = dragPositionX
      this.dragPositionY = dragPositionY
      this.ableChangeX = ableChangeX
      this.ableChangeY = ableChangeY
      this.circle = svg.circle(radius).fill('none').stroke({color, width}).move(x, y)
    }
    setActive ({active}) {
      this.active = active
    }
    setRadius ({radius}) {
      this.radius = radius
      this.circle.radius(radius)
    }
    del () {
      this.circle.remove()
    }
  }
/*
  class Square {
    constructor ({x = 0, y = 0, r, active = false, info}) {
      this.x = x
      this.y = y
      this.r = r
      this.active = active
      this.info = info
    }
    setActive () {}
    drag () {}
    scale () {}
    close () {}
  }
*/
  /*
    class Rectangle {
      constructor ({x = 0, y = 0, w = 0, h = 0, active = false, info}) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.active = active
        this.info = info
      }
      setActive () {}
      drag () {}
      scale () {}
      close () {}
    }
    class Square {
      constructor ({x = 0, y = 0, r, active = false, info}) {
        this.x = x
        this.y = y
        this.r = r
        this.active = active
        this.info = info
      }
      setActive () {}
      drag () {}
      scale () {}
      close () {}
    }
    class Info {
      constructor ({x, y, text}) {
        this.x = x
        this.y = y
        this.text = text
      }
      setDisplayType () {}
      setText () {}
    }
  */
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
/*
        if (e && (e.ctrlKey || e.metaKey) && e.keyCode === 68) _this.getJSON()
*/
        if (e && (e.ctrlKey || e.metaKey) && e.keyCode === 90) {
          if (this.circles.length <= 0) return false
          let circle = this.circles.pop()
          circle.del()
        }
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
        this.scale = 1
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
      startPaint (e) {
        e.preventDefault()
        this.polygonMouse.startOffsetX = e.offsetX
        this.polygonMouse.startOffsetY = e.offsetY
        this.polygonMouse.startClientX = e.clientX
        this.polygonMouse.startClientY = e.clientY
        this.currentCircle = new Circle({svg: this.draw, x: this.polygonMouse.startOffsetX, y: this.polygonMouse.startOffsetY})
        this.currentCircle.setActive({active: true})
      },
      painting (e) {
        if (this.currentCircle == null || !this.currentCircle.active) return false
        e.preventDefault()
        let nowX = e.clientX
        let fw = ~~(nowX - this.polygonMouse.startClientX)
        this.currentCircle.setRadius({radius: this.currentCircle.radius + fw > 0 ? this.currentCircle.radius + fw : 0})
        this.currentCircle.circle.on('click', function () {
          console.log(2323)
        })
        this.polygonMouse.startClientX = nowX
      },
      stopPaint (e) {
        if (this.currentCircle.radius > 2) this.circles.push(this.currentCircle)
        this.currentCircle.setActive({active: false})
        this.currentCircle = null
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
  .paint-tool {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .paint-tool-main {
    position: relative;
    height: 100%;
    overflow: hidden;
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC');
  }
  .paint-box-move-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 5px solid yellow;
  }
  .paint-box-move-layer-hide {
    display: none;
  }
  .paint-box {
    border: 1px solid red;
  }
  .paint-box-img {
    border: 1px solid green;

  }
  .cursor-move {
    cursor: move;
  }
  .el-header{
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    line-height: 60px;
  }
  .el-aside {
    background-color: #D3DCE6;
    color: #333;
    text-align: center;
    line-height: 200px;
  }
  body > .el-container {
    margin-bottom: 40px;
  }
</style>
