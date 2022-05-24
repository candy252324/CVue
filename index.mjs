import Compiler from './src/Compiler.mjs'
import observe from './src/observe.mjs'
import defineReactive from './src/defineReactive.mjs'
import proxyData from './src/proxyData.mjs'
import initData from './src/initData.mjs'

export default class MVue {
  constructor(options) {
    this.$options = options
    const { data } = this.$options
    if (data) {
      this.$data = typeof data === "function" ? data() : data
    } else {
      throw new Error("请传入data")
    }
    this.$set = this.set
    this._init(options)
  }
  _init(options) {
    initData(this)
    new Compiler(this.$options.el, this)  // 编译
  }
  /** 新增属性也要劫持 */
  set(obj, key, value) {
    this.$data[key] = value
    // 数组或对象
    if (value && typeof (value) === "object") {
      observe(value)
    } else {
      defineReactive(obj, key, value)
    }
    let newData = {}
    newData[key] = value
    proxyData(this, newData)  // 对新增的属性进行代理
  }
}

