// 数组响应式
const originArrayProto = Array.prototype
const newArrayProto = Object.create(originArrayProto)
// 为什么是这7个方法？因为数组上只有这7个方法会改变原数组，其它都是返回新数组
const methodsToPatch = ["push", "pop", "unshift", "shift", "splice", "sort", "reverse"]
methodsToPatch.forEach(method => {
  Object.defineProperty(newArrayProto, method, {
    value: function (...args) {
      const ret = originArrayProto[method].apply(this, args) // 7个方法完成本职工作
      console.log("数组也变成响应式啦！")
      return ret
    },
    configurable: true,
    writable: true,
    enumerable: false
  })
})
export default function reactiveArrayProtoType(arr) {
  arr.__proto__ = newArrayProto
}
