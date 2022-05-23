import Compiler from './src/Compiler.mjs'

export default class MVue {
  constructor(options) {
    this.$options = options
    this.$data = this.$options.data
    this.$set = this.set
    new Observer(this.$data)  // 数据劫持
    this.proxyData(this.$data) // 代理
    new Compiler(this.$options.el, this)  // 编译
  }
  /** 代理，使不仅能通过this.$data.name 获取/设置响应式数据，还能通过this.name 获取/设置数据 */
  proxyData(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        get: () => {
          return this.$data[key]
        },
        set: (newVal) => {
          this.$data[key] = newVal
        }
      })
    })
  }
  /** 新增属性也要劫持 */
  set(obj, key, value) {
    this.$data[key] = value
    // 数组或对象
    if (value && typeof(value)==="object") {
      new Observer(value)
    } else {
      defineProperty(obj, key, value)
    }
    let newData = {}
    newData[key] = value
    this.proxyData(newData)  // 对新增的属性进行代理
  }
}

/** 数据监听 */
class Observer {
  constructor(obj) {
    this.walk(obj)  // 递归数据劫持
  }
  walk(obj) {
    // 数组响应式
    if(Array.isArray(obj)){
      obj.__proto__ = newArrayProto
    } 
    //对象响应式
    else if(Object.prototype.toString.call(obj) === '[object Object]'){
      Object.keys(obj).forEach(key => {
        // 对象或数组
        if (obj[key] && typeof(obj[key])==="object") {
          this.walk(obj[key])
        } else {
          defineProperty(obj, key, obj[key])
        }
      })
    }
  }
}

// 数组响应式
const arrayProto = Array.prototype
const newArrayProto = Object.create(arrayProto)
// 为什么是这7个方法？因为数组上只有这7个方法会改变原数组，其它都是返回新数组
const methodsToPatch = ["push", "pop", "unshift", "shift", "splice", "sort", "reverse"]
methodsToPatch.forEach(method => {
  Object.defineProperty(newArrayProto, method, {
    value: function (...args) {
      const ret = arrayProto[method].apply(this, args) // 7个方法完成本职工作
      console.log("数组也变成响应式啦！")
      return ret
    },
    configurable: true,
    writable: true,
    enumerable: false
  })
})


/** 数据劫持函数 */
function defineProperty(obj, key, value) {
  Object.defineProperty(obj, key, {
    get: () => {
      console.log("get value:", value)
      return value
    },
    set: (newValue) => {
      console.log("set value", key, ":", newValue)
      if (newValue !== value) {
        value = newValue
      }
    }
  })
}
