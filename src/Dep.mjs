export default class Dep {
  constructor() {
    this.watchers = []
  }
  depend() {
    // 防止 watcher 被重复收集
    if (this.watchers.includes(Dep.target)) return
    this.watchers.push(Dep.target)
    console.log("depend:watchers!!!!!!")
    console.log(this.watchers)
  }
  notify() {
    console.log("notify:watchers!!!!!!")
    console.log(this.watchers)
    for (let watchers of this.watchers) {
      watchers.update()
    }
  }
}
Dep.target = null