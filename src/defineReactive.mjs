import Dep from './Dep.mjs'
import observe from './observe.mjs'

/** 数据监听 */
export default function defineReactive(obj, key, value) {
  let childOb = observe(value) // value可能是个对象，需要进行监听
  const dep = new Dep()

  Object.defineProperty(obj, key, {
    get: () => {
      // 如果Dep已经实例化过
      if (Dep.target) {
        dep.depend()  // 收集依赖
        // 如果存在子ob, 则顺道一起把子对象的依赖收集也完成
        if (childOb) {
          childOb.dep.depend()
        }
      }
      console.log("get value:", value)
      return value
    },
    set: (newValue) => {
      console.log("set value", key, ":", newValue)
      if (newValue === value) return
      value = newValue
      observe(value)  // set的值可能是个对象，需要进行监听
      dep.notify()  // 依赖通知更新
    }
  })
}
