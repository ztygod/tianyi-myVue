本章可以看作之后所有章节的总起与概括，相当于打开了一个全局视角，供我们来把握全体。

# 3.1 声明式地描述 UI

描述UI有两种形式，一是采用模板的方式来描述UI，另一种是使用虚拟DOM。虚拟DOM比模板更加灵活，但是模板方式更加直观。

# 3.2 初识渲染器

渲染器的主要作用就是将虚拟DOM 对象渲染为真实DOM。工作原理：递归地遍历虚 拟 DOM 对象，并调用原生 DOM API 来完成真实 DOM 的创建。渲染 器的精髓在于后续的更新，它会通过 Diff 算法找出变更点，并且只会更新需要更新的内容。
虚拟DOM：

```javascript
01 const vnode = {
02 tag: 'div',
03 props: {
04 onClick: () => alert('hello')
05 },
06 children: 'click me'
07 }
```

简单渲染器：

```javascript
01 function renderer(vnode, container) {
02 // 使用 vnode.tag 作为标签名称创建 DOM 元素
03 const el = document.createElement(vnode.tag)
04 // 遍历 vnode.props，将属性、事件添加到 DOM 元素
05 for (const key in vnode.props) {
06 if (/^on/.test(key)) {
07 // 如果 key 以 on 开头，说明它是事件
08 el.addEventListener(
09 key.substr(2).toLowerCase(), // 事件名称 onClick --->
click
10 vnode.props[key] // 事件处理函数
11 )
12 }
13 }
14
15 // 处理 children
16 if (typeof vnode.children === 'string') {
17 // 如果 children 是字符串，说明它是元素的文本子节点
18 el.appendChild(document.createTextNode(vnode.children))
19 } else if (Array.isArray(vnode.children)) {
20 // 递归地调用 renderer 函数渲染子节点，使用当前元素 el 作为挂载点
21 vnode.children.forEach(child => renderer(child, el))
22 }
23
24 // 将元素添加到挂载点下
25 container.appendChild(el)
26 }
```

# 3.3 组件的本质

一句话总结：组件就是一 组 DOM 元素的封装，这组 DOM 元素就是组件要渲染的内容。

# 3.4 模板的工作原理

那么模板是如何工作的 呢？这就要提到 Vue.js 框架中的另外一个重要组成部分：编译器。 编译器和渲染器一样，只是一段程序而已，不过它们的工作内容 不同。编译器的作用其实就是将模板编译为渲染函数。

# 3.5 Vue.js 是各个模块组成的有机整体

