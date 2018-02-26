/*取整数*/
function getInt(num) {
  let rounded
  rounded = (0.5 + num) | 0
  rounded = ~~ (0.5 + num)
  rounded = (0.5 + num) << 0
  return rounded
}
/*获取两数间的随机数*/
function getRandom(a , b){
  return Math.random()*(b-a)+a;
}
export {getInt, getRandom}
