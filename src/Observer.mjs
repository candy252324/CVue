import defineReactive from './defineReactive.mjs'
import reactiveArrayProtoType from './reactiveArrayProtoType.mjs'

/** 数据监听 */
export default class Observer {
  constructor(obj) {
    this.walk(obj)  // 递归数据劫持
  }
  walk(obj) {
    // 数组响应式
    if (Array.isArray(obj)) {
      reactiveArrayProtoType(obj)
    }
    //对象响应式
    else if (Object.prototype.toString.call(obj) === '[object Object]') {
      Object.keys(obj).forEach(key => {
        // 对象或数组
        if (obj[key] && typeof (obj[key]) === "object") {
          this.walk(obj[key])
        } else {
          defineReactive(obj, key, obj[key])
        }
      })
    }
  }
}