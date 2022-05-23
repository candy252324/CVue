class MVue {
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
    if (Object.prototype.toString.call(value) === "[object Object]") {
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
    if (Object.prototype.toString.call(obj) !== '[object Object]') {
      return
    }
    Object.keys(obj).forEach(key => {
      // 递归转化为响应式数据
      if (Object.prototype.toString.call(obj[key]) === "[object Object]") {
        this.walk(obj[key])
      } else {
        defineProperty(obj, key, obj[key])
      }
    })
  }
}

/** 模板编译 */
class Compiler {
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
        update(value)
      }
    }
  })
}

/** 页面更新逻辑*/
function update(value) {
  console.log("页面更新")
  // document.getElementById("app").innerHTML = value
}