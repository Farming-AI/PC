class DateFormat {
  constructor (date) {
    this.date = date
    this.y = ''
    this.m = ''
    this.d = ''
    this.hh = ''
    this.mm = ''
    this.ss = ''
    this.init()
  }
  init () {
    let date = this.date ? new Date(this.date) : new Date()
    this.y = date.getFullYear()
    this.m = date.getMonth() + 1
    this.d = date.getDate()
    this.hh = date.getHours()
    this.mm = date.getMinutes()
    this.ss = date.getSeconds()
  }
  format (fmt) {
    let o = {
      'M+': this.m,
      'd+': this.d,
      'h+': this.hh,
      'm+': this.mm,
      's+': this.ss
    }
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.y + '').substr(4 - RegExp.$1.length))
    for (let k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
    return fmt
  }
}
function formatTime (date) {
  return new DateFormat(date)
}

export {
  formatTime
}
