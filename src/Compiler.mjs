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
      if (this.isElement(node)) {
        this.compileElement(node)
      } else if (this.isText(node)) {
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
      const exp = matchStr.replace(/\{/g, "").replace(/\}/g, "")  // 取到插值里表达式： "name" or "hobby"
      nodeTextStr = nodeTextStr.replace(new RegExp(matchStr, "g"), this.$vm[exp]) // 将"{{name}}" 替换成"name"的值
    })
    node.textContent = nodeTextStr
  }
  // 编译元素
  compileElement(node) {
    let attrList = node.attributes
    Array.from(attrList).forEach(attr => {
      // m-text="name"
      const attrName = attr.name  //  m-text
      const exp = attr.value   //  name
      if (this.isDirective(attrName)) {
        const dir = attrName.slice(2)  // text
        this[dir] && this[dir](node, exp)
      }
    })
  }
  // 渲染v-text 
  text(node, exp) {
    node.textContent = this.$vm[exp]
  }
  // 渲染v-html
  html(node, exp) {
    node.innerHTML = this.$vm[exp]
  }
  // 判断是否是指令，如，m-text，m-html
  isDirective(attrName) {
    return attrName.indexOf("m-") === 0
  }
  // 是否是元素
  isElement(node) {
    return node.nodeType === 1
  }
  // 是否插值表达式{{}}
  isText(node) {
    return node.nodeType === 3 && /\{\{.*?\}\}/.test(node.textContent)
  }
}