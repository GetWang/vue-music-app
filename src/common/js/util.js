/* 从min和max之间随机取一个整数，包括min和max */
export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/* 洗牌函数 */
export function shuffle(arr) {
  // 拿到数组的一个副本，以使不改变原数组
  let _arr = arr.slice()
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let temp = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = temp
  }
  return _arr
}

/* 节流函数 */
export function debounce(func, delay) {
  let timer
  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
