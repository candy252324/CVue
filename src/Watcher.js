import Dep from './Dep.mjs'
export default class Watcher {
  constructor(cb) {
    this._cb = cb
    Dep.target = this
    this._cb()  // 执行回调函数时，会有一些this.xx的读取操作，从而触发getter进行依赖收集
    Dep.target = null // 防止重复依赖收集
  }
  update() {
    console.log("update!!!")
    this._cb()  // 当响应式数据更新时，执行_cb函数，更新dom
  }
}