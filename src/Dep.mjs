export default class Dep {
  constructor() {
    this.target = null
    this.watchers = []
  }
  depend() {
    this.watchers.push(this.target)
    console.log("watchers:::", this.watchers)
  }
  notify() {
    // console.log("notify!!!")
    for (let watchers of this.watchers) {
      watchers.update()
    }
  }
}