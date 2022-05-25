import Watcher from './Watcher.mjs'
/** 模板编译 */
export default class Compiler {
  constructor(el, vm) {
    this.$vm = vm
    this.$el = document.querySelector(el)
    if (this.$el) {
      this.compile(this.$el)
    }
  }
  compile(el) {
    el.childNodes.forEach(node => {
      // 元素
      if (node.nodeType === 1) {
        this.compileElement(node)
      }
      // 是否插值表达式 {{ }}
      else if (node.nodeType === 3 && /\{\{.*?\}\}/.test(node.textContent)) {
        this.compileText(node)
      }
      if (node.hasChildNodes()) {
        this.compile(node)
      }
    })
  }
  // 渲染插值表达式,  "我的名字是{{name}},我的爱好是{{hobby}}" 
  compileText(node) {
    let nodeTextStr = node.textContent
    const matchArr = new Set(nodeTextStr.match(/\{\{.*?\}\}/g))  // ["{{name}}","{{hobby}}"] 
    matchArr.forEach(matchStr => {
      const exp = matchStr.replace(/\{/g, "").replace(/\}/g, "").trim()  // 取到插值里表达式： "name" or "hobby"
      // ！！！！注意：Watcher 的回调函数中必须要有 this.xxx 的数据读取操作，用于触发getter，收集依赖
      new Watcher(() => {
        // 这里 nodeTextStr保留的是之前带花括号的文本, 形如 “我是{{name}},爱好{{hobby}}”
        // 导致的结果是，forEach循环后只有最后一个插值被数据内容替换,所以这里加了一个方法updateOtherText用于更新剩下的插值表达式内容
        node.textContent = nodeTextStr.replace(new RegExp(matchStr, "g"), this.$vm[exp])  //  将"{{name}}" 替换成"name"的值
        this.updateOtherText(node, matchArr)
      })
    })
  }
  // cjh todo 这里写的不太好
  updateOtherText(node, matchArr) {
    let nodeTextStr = node.textContent
    matchArr.forEach(matchStr => {
      const exp = matchStr.replace(/\{/g, "").replace(/\}/g, "").trim()   // 取到插值里表达式： "name" or "hobby"
      nodeTextStr = nodeTextStr.replace(new RegExp(matchStr, "g"), this.$vm[exp]) // 将"{{name}}" 替换成"name"的值
    })
    node.textContent = nodeTextStr  // 所有的插值表达式都被替换了
  }
  // 编译元素
  compileElement(node) {
    let attrList = node.attributes
    Array.from(attrList).forEach(attr => {
      // m-text="name"
      const attrName = attr.name  //  m-text
      const exp = attr.value   //  name

      // <button m-onclick="foo"/>
      if (attrName.match(/m-on:click/) || attrName.match(/@click/)) {
        const fn = this.$vm.$options.methods[exp]
        node.addEventListener("click", () => {
          fn.apply(this.$vm)
        })
      }
      // <span m-bind:title="xxx"></span>
      else if (attrName.match(/m-bind:/)) {
        // cjh todo
      }
      // <input type="text" v-model="name">
      else if (attrName.match(/m-model/)) {
        let tagName = node.tagName.toLowerCase()
        if (tagName === "input" && node.type === "text") {
          new Watcher(() => {
            node.value = this.$vm[exp]
            node.addEventListener("input", (e) => {
              this.$vm[exp] = e.target.value
            })
          })
        } else if (tagName === "input" && node.type === "checkbox") {
          new Watcher(() => {
            node.checked = this.$vm[exp]
            node.addEventListener("input", (e) => {
              this.$vm[exp] = e.target.checked
            })
          })
        } else if (tagName === "select") {

        }

      }
      // <span m-text="name"></span>
      else if (attrName.match(/m-text/)) {
        node.textContent = this.$vm[exp]
      }
      // <span m-html="name"></span>
      else if (attrName.match(/m-html/)) {
        node.innerHTML = this.$vm[exp]
      }
    })
  }
}