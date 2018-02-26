/**
* Created by newlmy on 2017/12/7.
*/

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
        </el-row>
        <el-row class="tool-item">
          <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="4">
            标记个数：
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="20">
            123
          </el-col>
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
    export default {
      name: '',
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
      created () {
      },
      beforeMount () {
      },
      mounted () {
      },
      beforeUpdate () {
      },
      updated () {
      },
      beforeDestroy () {
      },
      destroyed () {
      },
      methods: {
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
              //this.targets = new PointGroup({ctx: this.ctx, dotRadius: this.dotRadius})
            }
            //this.currentTarget = this.targets.add({x: offsetX, y: offsetY})
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
