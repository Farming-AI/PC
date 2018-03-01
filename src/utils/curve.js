function setCurvefragment (arr = [], ctx) { // 设置曲线路径片段
  var p0 = arr[1]
  var p1 = arr[2]
  ctx.bezierCurveTo(p0[0], p0[1], p1[0], p1[1], arr[3][0], arr[3][1])
}
function getCurveList (arr, a = 0.15, b = 0.15) { // 获取曲线数组
  if (arr.length < 3) { //
    return arr
  }
  var list = []
  var len = arr.length
  for (var i = 0; i < len; i++) {
    list[i] = []
    list[i].push(arr[(i - 1) < 0 ? len - 1 : i - 1])
    list[i].push(arr[i % len])
    list[i].push(arr[(i + 1) % len])
    list[i].push(arr[(i + 2) % len])
  }
  list = list.map(arr => {
    var p0 = [
      arr[1][0] + a * (arr[2][0] - arr[0][0]),
      arr[1][1] + a * (arr[2][1] - arr[0][1])
    ]
    var p1 = [
      arr[2][0] - b * (arr[3][0] - arr[1][0]),
      arr[2][1] - b * (arr[3][1] - arr[1][1])
    ]
    return [arr[1], p0, p1, arr[2]]
  })
  return list
}
function setCurvePath (list, ctx, isClosed) { // 设置完整曲线路径
  ctx.beginPath()
  ctx.moveTo(list[0][0][0], list[0][0][1])
  list.forEach((x, y) => {
    if (!isClosed && (y === 0 || y === list.length - 1)) {
      ctx.lineTo(x[3][0], x[3][1])
    } else {
      setCurvefragment(x, ctx)
    }
  })
}
function drawCurvePath (arr, ctx, option = {fillStyle: 'rgba(179, 205, 65, .5)', strokeStyle: '#ffffff'}) { // 直接绘制曲线路径,可直接使用
  var list = getCurveList(arr)
  ctx.save()
  for (var i in option) {
    ctx[i] = option[i]
  }
  setCurvePath(list, ctx, true)
  ctx.stroke()
  ctx.fill()
  ctx.restore()
}
function isPointInCurveArea (point, arr, ctx) { // point 选中的点 arr绘制曲线的点集合
  var list = getCurveList(arr)
  var len = list.length
  ctx.beginPath()
  ctx.moveTo(list[0][0][0], list[0][0][1])
  for (var i = 0; i < len; i++) {
    setCurvefragment(list[i], ctx)
  }
  ctx.closePath()
  return ctx.isPointInPath(point[0], point[1])
}
class Curve {
  constructor (option = {}) {
    this.pointArr = option.pointArr || [] // 存放点的数组
    this.startPointArr = this.pointArr.map(arr => arr.map(x => x))
    this.isClosed = option.isClosed || false// 是否绘制闭合路径,默认不闭合
    this.pointColor = option.pointColor || 'orange'
    this.pointSize = option.pointSize || 3
    this.polyLineStrokeColor = option.polyLineStrokeColor || 'red'
    this.polyLineSize = option.polyLineSize || 1
    this.fillColor = option.fillColor || 'rgba(79, 205, 65, .5)'
    this.isFill = option.isFill || true
    var el = option.el // canvas元素
    if (el) {
      this.el = el
      this.ctx = el.getContext('2d')
      this.ctx.fillStyle = this.fillColor
      this.ctx.strokeStyle = this.polyLineStrokeColor
    }
    this.init()
  }
  init () {
    this.isMouseDown = false
    this.selPoint = null // 选中点之后存储数据的对象
    this.isDrawDot = true // 判断是否在瞄点阶段, 初始化为true
    this.curveList = null// 点转化为贝塞尔曲线的数组, 初始为null
    this.newPointIndexAtClosed = null // 闭合后新增的点的索引
    this.reDraw()
  }
  /* 画布操作 */
  clear () { // 清空当前的Curve
    this.empty()
    this.pointArr = []
    this.isClosed = false
    this.init()
  }
  empty () {
    var canvasStyle = window.getComputedStyle(this.el)
    this.ctx.clearRect(0, 0, canvasStyle.width.replace('px', ''), canvasStyle.height.replace('px', ''))
  }
  paintPoint (point, ctx = this.ctx) {
    if (!ctx) {
      return
    }
    ctx.beginPath()
    ctx.arc(point[0], point[1], this.pointSize, 0, 2 * Math.PI)
    ctx.fillStyle = this.pointColor
    ctx.closePath()
    ctx.fill()
  }
  paintPolyLine (points, ctx = this.ctx) { // points 点的集合, 绘制折线
    if (!ctx) { return }
    ctx.beginPath()
    ctx.strokeStyle = this.polyLineStrokeColor
    ctx.moveTo(points[0][0], points[0][1])
    for (var i = 1, len = points.length; i < len; i++) {
      ctx.lineTo(points[i][0], points[i][1])
    }
    ctx.stroke()
  }

  withDraw () { // 撤回
    if (this.pointArr.length <= 3 && this.isClosed) { // 当点少于3且是闭合状态时操作无效
      return
    }
    if (this.newPointIndexAtClosed === null) { // 当不是插入点的时候
      this.pointArr.pop()
    } else {
      this.pointArr.splice(this.newPointIndexAtClosed, 1)
    }
    this.curveList = getCurveList(this.pointArr)
    // 重绘
    this.reDraw()
  }
  changePointSize (num) { // 修改点的尺寸
    this.pointSize += num
    this.reDraw()
  }
  changeLineSize (num) {
    this.polyLineSize += num
    this.reDraw()
  }
  reDraw (cb) { // 重绘, 完成后可执行传入的回调
    if (!this.el || this.pointArr.length === 0) { return }
    this.empty()
    var ctx = this.ctx
    ctx.save()
    if (this.polyLineSize) {
      ctx.lineWidth = this.polyLineSize
    }
    if (!this.isClosed || this.pointArr.length < 3) {
      this.reDrawAtDrawingDot()
    } else {
      this.reDrawAtClosedDot()
    }
    ctx.restore()
    cb && cb()
  }
  reDrawAtDrawingDot () { // 在描点时的重绘操作
    this.pointArr.forEach(point => this.paintPoint(point))
      // 闭合前使用线段
    var len = this.pointArr.length
    if (len < 2) { return }
    if (len < 3) {
      this.paintPolyLine(this.pointArr)
    } else {
      this.curveList = getCurveList(this.pointArr).filter((x, y, z) => y !== z.length - 1)
      setCurvePath(this.curveList, this.ctx, this.isClosed)
      this.ctx.stroke()
    }
  }
  reDrawAtClosedDot () { // 在闭合时的重绘操作
    this.ctx.save()
    this.pointArr.forEach(point => this.paintPoint(point))
    setCurvePath(this.curveList, this.ctx, this.isClosed)
    this.ctx.stroke()
    if (this.isFill) {
      if (this.fillColor) { this.ctx.fillStyle = this.fillColor }
      this.ctx.fill()
      this.ctx.restore()
    }
  }
  closePath () { // 闭合所有的点路径
    this.isClosed = true
    this.curveList = getCurveList(this.pointArr)
    this.reDraw()
  }
  getClickPointInd (clickCoord, points = this.pointArr) { // 判断是否点击在点上
    var len = points.length
    var limitR = Math.max(this.pointSize, 5)
    for (var i = 0; i < len; i++) {
      if (this.getPointDistance(points[i], clickCoord) <= limitR) { // 在点的范围内
        return i
      }
    }
    return false
  }
  /* 对点集合的操作 */
  add (point) {
    this.pointArr.push(point)
    this.reDraw()
  }
  replace (arr, opiton = {}) {
    this.isClosed = opiton.isClosed || true // 默认为直接替换已闭合的
    this.pointArr = arr
    this.curveList = getCurveList(arr)
    this.reDraw()
  }
  getPointList () { // 获取所有的点
    return this.pointArr.map(arr => arr.map(x => x))
  }
  /* 计算函数 */
  getPointDistance (p0, p1) { // 获得两点的距离
    var x = p0[0] - p1[0]
    var y = p0[1] - p1[1]
    var z = this.pow(x, 2) + this.pow(y, 2)
    return this.pow(z, 0.5)
  }
  pow (num, k = 2) {
    return Math.pow(num, k)
  }
  /* 鼠标事件 */
  curveMouseDown (e) { // 响应鼠标点击
    this.isMouseDown = true
    var clickCoord = [e.offsetX, e.offsetY]
    var num = this.getClickPointInd(clickCoord, this.pointArr)
    if (num !== false) { // 判断点击是否在点集合的点范围内，此时不可增加点
      this.setSelPoint(num, clickCoord)
      return
    }
    if (!this.isClosed) { // 未闭合的情况下,直接增加
      this.add(clickCoord)
      return
    }
    // 闭合的情况下,判断点是否在曲线上
    var ind = this.isPointInCurve(clickCoord)
    console.log(ind)
    if (ind !== false) { // 增加点在曲线上
      var len = this.pointArr.length
      this.newPointIndexAtClosed = ind + 1// 新增点的索引位置
      if (ind + 1 === len) {
        console.log(clickCoord)
        this.pointArr.push(clickCoord)
      } else {
        this.pointArr.splice((ind + 1) % len, 0, clickCoord)
      }
      this.setSelPoint(ind + 1, clickCoord)
      this.curveList = getCurveList(this.pointArr)
      this.reDraw()
      return
    }
  }
  curveMouseMove (e) {
    if (this.isMouseDown && this.selPoint !== null) { // 此时需要移动点
      var mouseDownCoord = this.selPoint.clickCoord
      var index = this.selPoint.index
      var x = e.offsetX - mouseDownCoord[0]
      var y = e.offsetY - mouseDownCoord[1]
      var obj = this.selPoint.oldPoint
      this.pointArr[index] = [obj[0] + x, obj[1] + y]
      // 获取新的曲线数组
      this.curveList = getCurveList(this.pointArr)
      // 重绘
      this.reDraw()
    }
  }
  curveMouseUp () {
    this.isMouseDown = false
    this.selPoint = null
  }
  setSelPoint (num, clickCoord) { // 设置选中的点
    var point = this.pointArr[num]
    this.selPoint = {
      index: num,
      oldPoint: [point[0], point[1]],
      clickCoord
    }
  }
  /* 判断点是否在曲线上 */
  isPointInCurve (point) {
    var len = this.curveList.length
    this.ctx.save()
    for (var i = 0; i < len; i++) {
      var list = this.curveList[i]
      this.ctx.beginPath()
      this.ctx.lineWidth = 5
      this.ctx.moveTo(list[0][0], list[0][1])
      setCurvefragment(list, this.ctx)
      this.ctx.closePath()
      if (this.ctx.isPointInStroke(point[0], point[1])) {
        this.ctx.restore()
        return i
      }
    }
    this.ctx.restore()
    return false
  }
  isPointInCurveArea (point) {
    var bool = isPointInCurveArea(point, this.pointArr, this.ctx)
    return bool || (this.getClickPointInd(point, this.pointArr) !== false)
  }
}
export {
  Curve,
  setCurvefragment,
  setCurvePath,
  getCurveList,
  isPointInCurveArea,
  drawCurvePath
}
