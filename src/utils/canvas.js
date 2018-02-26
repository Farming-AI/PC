//:todo canvas 抽象未完待续
let RAF = (function(){
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {window.setTimeout(callback, 1000 / 60); };
})()
export {RAF}

class Point {
  constructor ({x = 0, y = 0, dotRadius = 2, ctx, fillStyle = 'rgba(255, 113, 98, 1)'}) {
    this.ctx = ctx
    this.dotRadius = dotRadius
    this.fillStyle = fillStyle
    this.x = x
    this.y = y
  }
  paint ({dotRadius = this.dotRadius}) {
    this.dotRadius = dotRadius
    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.fillStyle = this.fillStyle
    this.ctx.arc(this.x, this.y, dotRadius, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.restore()
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
class CatchPoint {
  constructor ({x, y, dotRadius}) {


  }
}
class CatchPointGroup {
  constructor ({ctx}) {
    this.ctx = ctx

  }

}
class canvas {
  constructor ({id, width, height, x, y}) {

  }
  init () {}
  move () {}
  scale () {}
  transformImg () {}
}
