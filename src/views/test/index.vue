/**
* Created by newlmy on 2017/10/18.
*/

<template>
  <div>
    <div style="position: absolute;z-index: 1;left: 5%; top:3%">
      <label for="file_input" class="el-button el-button--primary">
        选择图片
        <input type="file" id="file_input"  @change="uploadImg" style="position:absolute;clip:rect(0 0 0 0);left: -1000px;top:0;"/>
      </label>
      <el-button type="primary" @click="clickEdit">
        {{drawBard.editing ? '结束标记' : '开始标记'}}
      </el-button>
      <el-button type="primary" @click="clearMarks">
        清除全部标记
      </el-button>
      <el-button type="primary" @click="send">
        完成提交
      </el-button>
    </div>
    <div class="draw-container"
         @mousemove="mousemoveTarget"
         @mouseup="mouseupTarget"
    >
      <div class="vue-canvas" ref="canvas">
        <div class="vue-canvas-target"
             :class="{'cursor-move': !drawBard.editing, 'img-draw': drawBard.editing}"
             :style="{
                'width': drawBard.imgBoxW + 'px',
                'height': drawBard.imgBoxH + 'px',
                'transform': 'scale(' + drawBard.scale + ',' + drawBard.scale + ') ' + 'translate3d('+ drawBard.x / drawBard.scale + 'px,' + drawBard.y / drawBard.scale + 'px,' + '0)'
                + 'rotateZ('+ rotate * 90 +'deg)'
                }"
             @mousedown="mousedownTarget"
             @mouseout="mouseoutTarget"
             @mousewheel="scaleImg"
        >
          <img :src="img" alt="" style="display:block" ref="targetImg">
          <div
            class="vue-selected-square"
            v-for="(item, index) in squareness"
            v-show="item.w>0 && item.h>0"
            :style="{
                'width': item.w + 'px',
                'height': item.h + 'px',
                'transform': 'translate3d('+ item.startOffsetX + 'px,' + item.startOffsetY + 'px,' + '0)'
              }"
          >
            <span class="square-info" v-if="item.w > 0">{{ item.w }} × {{ item.h }}</span>
            <span class="del-btn" v-if="!item.isChange">
              <i class="ali-icon-shanchu"  @click="clickDel(index)"></i>
            </span>
            <span
              class="square-face"
              :class="{'cursor-move': item.isMove}"
              @dblclick.stop="clickSquare({e: $event, target: item})"
              @mousedown.stop="mousedownSquare({e: $event, target: item})"
              @mouseout.stop="mouseoutSquare"
            ></span>
            <span v-show="item.isChange">
              <span class="square-line line-w" @mousedown.stop="changeSquareSize({e: $event, target: item, ableChangeX: false, ableChangeY: true, dragPositionY: 'top'})"></span>
              <span class="square-line line-a" @mousedown.stop="changeSquareSize({e: $event, target: item, ableChangeX: true, ableChangeY: false, dragPositionX: 'left'})"></span>
              <span class="square-line line-s" @mousedown.stop="changeSquareSize({e: $event, target: item, ableChangeX: false, ableChangeY: true, dragPositionY: 'bottom'})"></span>
              <span class="square-line line-d" @mousedown.stop="changeSquareSize({e: $event, target: item, ableChangeX: true, ableChangeY: false, dragPositionX: 'right'})"></span>
              <span class="square-move-point point1" @mousedown.stop="changeSquareSize({e: $event, target: item, ableChangeX: true, ableChangeY: true, dragPositionX: 'left', dragPositionY: 'top'})"></span>
              <span class="square-move-point point2" @mousedown.stop="changeSquareSize({e: $event, target: item, ableChangeX: false, ableChangeY: true, dragPositionY: 'top'})"></span>
              <span class="square-move-point point3" @mousedown.stop="changeSquareSize({e: $event, target: item, ableChangeX: true, ableChangeY: true, dragPositionX: 'right', dragPositionY: 'top'})"></span>
              <span class="square-move-point point4" @mousedown.stop="changeSquareSize({e: $event, target: item, ableChangeX: true, ableChangeY: false, dragPositionX: 'left'})"></span>
              <span class="square-move-point point5" @mousedown.stop="changeSquareSize({e: $event, target: item, ableChangeX: true, ableChangeY: false, dragPositionX: 'right'})"></span>
              <span class="square-move-point point6" @mousedown.stop="changeSquareSize({e: $event, target: item, ableChangeX: true, ableChangeY: true, dragPositionX: 'left', dragPositionY: 'bottom'})"></span>
              <span class="square-move-point point7" @mousedown.stop="changeSquareSize({e: $event, target: item, ableChangeX: false, ableChangeY: true, dragPositionY: 'bottom'})"></span>
              <span class="square-move-point point8" @mousedown.stop="changeSquareSize({e: $event, target: item, ableChangeX: true, ableChangeY: true, dragPositionX: 'right', dragPositionY: 'bottom'})"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import {formatTime} from 'utils/util'
  import {fileTransformDataURL, getFile, isImage, autoDownload, textTransformDataURL, toXml} from 'utils/file'
  import {isEmpty} from 'utils/index'
  class DrawBard {
    constructor ({width = 0, height = 0, startClientX = 0, startClientY = 0, imgBoxW = 0, imgBoxH = 0, moveX = 0, moveY = 0}) {
      this.w = width
      this.h = height
      this.x = startClientX
      this.y = startClientY
      this.imgBoxW = imgBoxW
      this.imgBoxH = imgBoxH
      this.maxDrawWidth = this.w
      this.maxDrawHeight = this.h
      this.moveX = moveX
      this.moveY = moveY
      this.scale = 1
      this.editing = false
      this.moving = false
    }
    changeSize ({change}) {
      let coe = 0.2
      coe = coe / this.imgBoxW > coe / this.imgBoxH ? coe / this.imgBoxH : coe / this.imgBoxW
      let num = coe * change
      num < 0 ? this.scale += Math.abs(num) : this.scale > Math.abs(num) ? this.scale -= Math.abs(num) : this.scale
    }
    startMove (startX, startY) {
      this.moving = true
      this.moveX = startX - this.x
      this.moveY = startY - this.y
    }
    move (nowX, nowY, vue) {
      this.moving && vue.$nextTick(() => {
        this.x = ~~(nowX - this.moveX)
        this.y = ~~(nowY - this.moveY)
      })
    }
    endMove () {
      this.moving = false
    }
    imgReload ({vue}) {
      vue.$refs.targetImg.onload = () => {
        this.w = ~~(window.getComputedStyle(vue.$refs.canvas).width.replace('px', ''))
        this.h = ~~(window.getComputedStyle(vue.$refs.canvas).height.replace('px', ''))
        this.imgBoxW = vue.$refs.targetImg.width
        this.imgBoxH = vue.$refs.targetImg.height
        this.maxDrawWidth = this.imgBoxW
        this.maxDrawHeight = this.imgBoxH
        this.rotate = 0
        if (this.imgBoxW > this.w) this.scale = this.w / this.imgBoxW
        if (this.imgBoxH * this.scale > this.h) this.scale = this.h / this.imgBoxH
        console.log(this.scale)
        this.x = (this.w - this.imgBoxW) / 2
        this.y = (this.h - this.imgBoxH) / 2
      }
    }
  }
  class DrawSquareness {
    constructor ({width = 0, height = 0, startClientX = 0, startClientY = 0, startOffsetX = 0, startOffsetY = 0, info = '', style = {}, className = 'vue-selected-square'}) {
      this.w = width
      this.h = height
      this.startClientX = startClientX
      this.startClientY = startClientY
      this.startOffsetX = startOffsetX
      this.startOffsetY = startOffsetY
      this.defaultOffsetX = 0
      this.defaultOffsetY = 0
      this.ableChangeX = true
      this.ableChangeY = true
      this.dragPositionX = ''
      this.dragPositionY = ''
      this.drawing = false
      this.isChange = false
      this.isMove = false
      this.info = this.w + '*' + this.h
      this.style = ''
      this.className = ''
    }
    startChange ({startClientX, startClientY, startOffsetX, startOffsetY, ableChangeX = true, ableChangeY = true, dragPositionX = 'right', dragPositionY = 'bottom'}) {
      if (!isEmpty(startOffsetX)) this.startOffsetX = startOffsetX
      if (!isEmpty(startOffsetY)) this.startOffsetY = startOffsetY
      this.drawing = true
      this.isChange = true
      this.startClientX = startClientX
      this.startClientY = startClientY
      this.defaultOffsetX = this.startOffsetX
      this.defaultOffsetY = this.startOffsetY
      this.ableChangeX = ableChangeX
      this.ableChangeY = ableChangeY
      this.dragPositionX = dragPositionX
      this.dragPositionY = dragPositionY
      this.oldW = this.w
      this.oldH = this.h
    }
    draw ({nowClientX, nowClientY, vue, drawBard}) {
      this.drawing && vue.$nextTick(() => {
        let fw = ~~(nowClientX - this.startClientX)
        let fh = ~~(nowClientY - this.startClientY)
        if (this.ableChangeX) {
          if (this.dragPositionX === 'right') {
            if (fw > 0) {
              this.w = this.oldW + fw > drawBard.maxDrawWidth - this.defaultOffsetX ? drawBard.maxDrawWidth - this.defaultOffsetX : this.oldW + fw
            } else {
              this.w = Math.abs(fw) < this.oldW ? this.oldW - Math.abs(fw) : Math.abs(fw) - this.oldW > this.defaultOffsetX ? this.defaultOffsetX : Math.abs(fw) - this.oldW
              this.startOffsetX = Math.abs(fw) < this.oldW ? this.defaultOffsetX : Math.abs(fw) - this.oldW > this.defaultOffsetX ? 0 : this.defaultOffsetX - Math.abs(fw) + this.oldW
            }
          } else if (this.dragPositionX === 'left') {
            if (fw > 0) {
              this.w = this.oldW - fw > 0 ? this.oldW - fw : fw - this.oldW > drawBard.maxDrawWidth - this.defaultOffsetX - this.oldW ? drawBard.maxDrawWidth - this.defaultOffsetX - this.oldW : fw - this.oldW
              this.startOffsetX = this.oldW - fw > 0 ? this.defaultOffsetX + fw : this.defaultOffsetX + this.oldW
            } else {
              this.w = Math.abs(fw) > this.defaultOffsetX ? this.oldW + this.defaultOffsetX : this.oldW + Math.abs(fw)
              this.startOffsetX = Math.abs(fw) > this.defaultOffsetX ? 0 : this.defaultOffsetX - Math.abs(fw)
            }
          }
        }
        if (this.ableChangeY) {
          if (this.dragPositionY === 'top') {
            if (fh > 0) {
              this.h = this.oldH - fh > 0 ? this.oldH - fh : fh - this.oldH > drawBard.maxDrawHeight - this.oldH - this.defaultOffsetY ? drawBard.maxDrawHeight - this.defaultOffsetY - this.oldH : fh - this.oldH
              this.startOffsetY = this.oldH - fh > 0 ? this.defaultOffsetY + fh : this.defaultOffsetY + this.oldH
            } else {
              this.h = Math.abs(fh) > this.defaultOffsetY ? this.oldH + this.defaultOffsetY : this.oldH + Math.abs(fh)
              this.startOffsetY = Math.abs(fh) > this.defaultOffsetY ? 0 : this.defaultOffsetY - Math.abs(fh)
            }
          } else if (this.dragPositionY === 'bottom') {
            if (fh > 0) {
              this.h = this.oldH + fh > drawBard.maxDrawHeight - this.defaultOffsetY ? drawBard.maxDrawHeight - this.defaultOffsetY : this.oldH + fh
            } else {
              this.h = Math.abs(fh) < this.oldH ? this.oldH - Math.abs(fh) : Math.abs(fh) - this.oldH > this.defaultOffsetY ? this.defaultOffsetY : Math.abs(fh) - this.oldH
              this.startOffsetY = Math.abs(fh) < this.oldH ? this.defaultOffsetY : Math.abs(fh) - this.oldH > this.defaultOffsetY ? 0 : this.defaultOffsetY - Math.abs(fh) + this.oldH
            }
          }
        }
      })
    }
    endDraw () {
      this.drawing = false
    }
    startMove ({startClientX, startClientY}) {
      this.startClientX = startClientX
      this.startClientY = startClientY
      this.defaultOffsetX = this.startOffsetX
      this.defaultOffsetY = this.startOffsetY
      this.isMove = true
    }
    move ({nowClientX, nowClientY, vue, drawBard}) {
      this.isMove && vue.$nextTick(() => {
        let moveW = ~~(nowClientX - this.startClientX)
        let moveH = ~~(nowClientY - this.startClientY)
        if (moveW > 0) {
          this.startOffsetX = moveW > drawBard.imgBoxW - this.w - this.defaultOffsetX ? drawBard.imgBoxW - this.w : this.defaultOffsetX + moveW
        } else {
          this.startOffsetX = Math.abs(moveW) < this.defaultOffsetX ? this.defaultOffsetX + moveW : 0
        }
        if (moveH > 0) {
          this.startOffsetY = moveH > drawBard.imgBoxH - this.h - this.defaultOffsetY ? drawBard.imgBoxH - this.h : this.defaultOffsetY + moveH
        } else {
          this.startOffsetY = Math.abs(moveH) < this.defaultOffsetY ? this.defaultOffsetY + moveH : 0
        }
      })
    }
    endMove () {
      this.isMove = false
    }
  }
  export default {
    name: 'test',
    data () {
      return {
        rotate: 0,
        count: '',
        editing: false,
        img: '',
        file: '',
        squareness: [],
        support: '',
        drawBard: {},
        currentSquare: {},
        xmlObj: {
          annotation: {
            folder: 'OXIIIT',
            filename: '',
            source: {
              database: 'OXFORD_IIIT Pet Datase',
              annotation: 'OXIIIT',
              image: 'flickr'
            },
            size: {
              width: '',
              height: '',
              depth: '3'
            },
            objects: []
          }
        }
      }
    },
    watch: {
      img: function (oldVal, newVal) {
        if (newVal !== oldVal) {
          this.initDrawbard()
        }
      },
      'drawBard.editing': function (oldVal, newVal) {
        if (newVal) this.currentSquare.isChange = false
      }
    },
    methods: {
      // 缩放图片
      scaleImg (e) {
        let change = e.deltaY || e.wheelDelta
        this.drawBard.changeSize({change})
      },
      // 移出框
      cancleScale () {
      },
      mousedownTarget (e) {
        e.preventDefault()
        let startX = e.clientX
        let startY = e.clientY
        let offsetX = e.offsetX
        let offsetY = e.offsetY
        if (!this.drawBard.editing) {
          this.drawBard.startMove(startX, startY, this)
        } else {
          if (this.currentSquare.isChange && !!this.currentSquare.isChange) {
            this.currentSquare.isChange = false
          }
          this.currentSquare = new DrawSquareness({})
          this.currentSquare.startChange({
            startClientX: startX,
            startClientY: startY,
            startOffsetX: offsetX,
            startOffsetY: offsetY
          })
          this.squareness.push(this.currentSquare)
        }
      },
      mousemoveTarget (e) {
        e.preventDefault()
        let nowX = e.clientX
        let nowY = e.clientY
        if (!this.drawBard.editing) {
          this.drawBard.move(nowX, nowY, this)
        } else {
          if (this.currentSquare.isMove) {
            this.currentSquare.move({nowClientX: nowX, nowClientY: nowY, vue: this, drawBard: this.drawBard})
          } else {
            this.currentSquare.drawing && this.currentSquare.isChange && this.currentSquare.draw({nowClientX: nowX, nowClientY: nowY, vue: this, drawBard: this.drawBard})
          }
        }
      },
      mouseupTarget (e) {
        if (!this.drawBard.editing) {
          this.drawBard.endMove()
        } else {
          this.currentSquare.isMove && this.currentSquare.endMove()
          this.currentSquare.drawing && this.currentSquare.endDraw()
        }
      },
      mouseoutTarget (e) {
        if (!this.drawBard.editing) {
          this.drawBard.endMove()
        }
      },
      changeSquareSize ({e, target, ableChangeX, ableChangeY, dragPositionX, dragPositionY}) {
        let startClientX = e.clientX
        let startClientY = e.clientY
        this.currentSquare = target
        this.currentSquare.startChange({startClientX, startClientY, ableChangeX, ableChangeY, dragPositionX, dragPositionY})
      },
      clickSquare ({e, target}) {
        if (!this.drawBard.editing) return
        if (target.isChange && !!target.isChange) return
        if (this.currentSquare.isChange && !!this.currentSquare.isChange) {
          this.currentSquare.isChange = false
        }
        this.currentSquare = target
        this.currentSquare.isChange = true
      },
      mousedownSquare ({e, target}) {
        if (!this.drawBard.editing) return
        let startClientX = e.clientX
        let startClientY = e.clientY
        if (this.currentSquare.isChange && !!this.currentSquare.isChange) {
          this.currentSquare.isChange = false
        }
        this.currentSquare = target
        this.currentSquare.isChange = true
        this.currentSquare.startMove({startClientX, startClientY})
      },
      mouseoutSquare (e) {
        this.currentSquare.isMove && this.currentSquare.endMove()
      },
      uploadImg (e) {
        this.file = getFile({e})
        if (!this.file || !isImage(this.file.ext)) {
          this.$alert('请选择以下图片类型：.gif/jpeg/jpg/png/bmp', '提示')
          return false
        }
        this.img = fileTransformDataURL(this.file.file)
      },
      clickEdit () {
        this.drawBard.editing = !this.drawBard.editing
      },
      clickDel (index) {
        this.squareness.splice(index, 1)
      },
      clearMarks () {
        this.squareness.length && this.squareness.splice(0, this.squareness.length)
      },
      send () {
        if (!this.squareness.length) return false
        this.editing = false
        this.xmlObj.annotation.filename = this.file.file.name
        this.xmlObj.annotation.size.width = this.drawBard.imgBoxW
        this.xmlObj.annotation.size.height = this.drawBard.imgBoxH
        let obj = []
        this.squareness.forEach((item) => {
          if (item.w > 0 && item.h > 0) {
            obj.push({
              key: 'object',
              name: '可乐',
              pose: 'Frontal',
              truncated: 0,
              occluded: 0,
              bndbox: {
                xmin: item.startOffsetX,
                ymin: item.startOffsetY,
                xmax: item.startOffsetX * 1 + item.w * 1,
                ymax: item.startOffsetY * 1 + item.h * 1
              }
            })
          }
        })
        this.xmlObj.annotation.objects = obj
        let text = toXml(this.xmlObj, 'key')
        let dataURL = textTransformDataURL(text)
        let filename = '' + this.file.name + '_' + formatTime().format('yyyyMMdd') + '.xml'
        autoDownload({dataURL, filename})
      },
      initDrawbard () {
        this.drawBard.w = 0
        this.drawBard.h = 0
        this.drawBard.x = 0
        this.drawBard.y = 0
        this.drawBard.imgBoxW = 0
        this.drawBard.imgBoxH = 0
        this.drawBard.maxDrawWidth = 0
        this.drawBard.maxDrawHeight = 0
        this.drawBard.moveX = 0
        this.drawBard.moveY = 0
        this.drawBard.scale = 1
        this.drawBard.editing = false
        this.drawBard.moving = false
        this.currentSquare = {}
        this.clearMarks()
      }
    },
    mounted () {
      let _this = this
      this.drawBard = new DrawBard({})
      this.drawBard.imgReload({vue: this})
      document.onkeydown = function (e) {
        e.preventDefault()
        if (e && (e.ctrlKey || e.metaKey) && e.keyCode === 68) _this.send()
        if (e && e.key === 'Shift' || e.keyCode === 16) _this.clickEdit()
      }
    },
    destroyed () {
      this.editing = false
    }
  }
</script>
<style scoped>
  .draw-container{
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
  }
  .vue-canvas {
    width: 90%;
    height: 80%;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
    user-select: none;
    direction: ltr;
    touch-action: none;
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC');
  }
  .vue-canvas-drag-box {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
  }
  .vue-canvas-target img {
    position: relative;
    user-select: none;
    transform: none;
  }
  .cursor-move {
    cursor: move;
  }
  .img-draw {
    cursor: crosshair;
  }
  .vue-selected-square {
    position: absolute;
    left: 0;
    top: 0;
    border: 1px solid red
  }
  .square-info {
    position: absolute;
    left: -3px;
    top: -23px;
    min-width: 65px;
    text-align: center;
    color: white;
    line-height: 20px;
    background-color: rgba(0, 0, 0, 0.5);
    font-size: 12px;
  }
  .square-face {
    cursor: default;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    user-select: none;
    background-color: #fff;
    opacity: 0.1;
  }

  .del-btn {
    cursor: pointer;
    position: absolute;
    right: -10px;
    top: -23px;
    height: 20px;
    width: 20px;
    text-align: center;
    line-height: 20px;
    border-radius: 20px;
    color: white;
    background-color: rgba(0, 0, 0, 0.5);
    font-size: 12px;
  }

  .square-line {
    position: absolute;
    display: block;
    width: 100%;
    height: 100%;
    opacity: .1;
  }

  .line-w {
    top: -3px;
    left: 0;
    height: 5px;
    cursor: n-resize;
  }

  .line-a {
    top: 0;
    left: -3px;
    width: 5px;
    cursor: w-resize;
  }

  .line-s {
    bottom: -3px;
    left: 0;
    height: 5px;
    cursor: s-resize;
  }

  .line-d {
    top: 0;
    right: -3px;
    width: 5px;
    cursor: e-resize;
  }

  .square-move-point {
    position: absolute;
    width: 8px;
    height: 8px;
    opacity: .75;
    background-color: #ff514c;
    border-radius: 100%;
  }

  .point1 {
    top: -4px;
    left: -4px;
    cursor: nw-resize;
  }

  .point2 {
    top: -5px;
    left: 50%;
    margin-left: -3px;
    cursor: n-resize;
  }

  .point3 {
    top: -4px;
    right: -4px;
    cursor: ne-resize;
  }

  .point4 {
    top: 50%;
    left: -4px;
    margin-top: -3px;
    cursor: w-resize;
  }

  .point5 {
    top: 50%;
    right: -4px;
    margin-top: -3px;
    cursor: w-resize;
  }

  .point6 {
    bottom: -5px;
    left: -4px;
    cursor: sw-resize;
  }

  .point7 {
    bottom: -5px;
    left: 50%;
    margin-left: -3px;
    cursor: s-resize;
  }

  .point8 {
    bottom: -5px;
    right: -4px;
    cursor: nw-resize;
  }

  @media screen and (max-width: 500px) {
    .square-move-point {
      position: absolute;
      width: 20px;
      height: 20px;
      opacity: .45;
      background-color: #39f;
      border-radius: 100%;
    }

    .point1 {
      top: -10px;
      left: -10px;
    }

    .point2, .point4, .point5, .point7 {
      display: none;
    }

    .point3 {
      top: -10px;
      right: -10px;
    }

    .point4 {
      top: 0;
      left: 0;
    }

    .point6 {
      bottom: -10px;
      left: -10px;
    }

    .point8 {
      bottom: -10px;
      right: -10px;
    }
  }
</style>
