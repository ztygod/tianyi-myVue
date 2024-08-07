# 减少DOM操作的性能开销
在上一章中，我们在实现更新 新旧节点都是子节点的情况下，采用了一个简单直接的方法，即卸载全部子节点再挂载全部新子节点。因为没有复用DOM元素，这样会带来较大的性能开销。
我们应找到找到新旧节点相同与不同的地方，只对不同的地方进行更新。
比如当子节点类型都相同只有文本子节点不同时：
![屏幕截图 2024-04-13 102044.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1712974851280-7607e8ae-c0da-4783-8e03-9031d3ed390d.png#averageHue=%23e2e2e2&clientId=ua0ceb1b2-a420-4&from=ui&id=uaf24a684&originHeight=332&originWidth=576&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=46480&status=done&style=none&taskId=uc11c1bd3-f2c4-49b9-937c-a9641b4a5f0&title=)
![屏幕截图 2024-04-13 102053.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1712974861340-f355fb1c-30d0-40a9-a641-64c8d64cbdeb.png#averageHue=%23e3e3e3&clientId=ua0ceb1b2-a420-4&from=ui&id=u77fedb6f&originHeight=328&originWidth=585&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=47074&status=done&style=none&taskId=uf43c6975-2ce1-4776-93de-7731ac6dabc&title=)
```javascript
import unmount from "../vue渲染实现/unmount"

function pathChildren(n1, n2, container) {
  //判断新子节点是否是文本节点
  if (typeof n2.children === 'string') {
    //省略部分代码
  } else if (Array.isArray(n2.children)) {
    //判断旧节点是否也是一组子节点
    if (Array.isArray(n1.children)) {
      //================重点！！！===================
      const oldChildren = n1.children
      const newChildren = n2.children
      //旧的一组子节点长度
      const oldLen = oldChildren.length
      //新的一组子节点长度
      const newLen = newChildren.length
      //取二者中短的那一个
      const commonLength = Math.min(oldLen, newLen)
      //遍历commonLength次
      for (let i = 0; i < commonLength; i++) {
        patch(oldChildren[i], newChildren[i], container)
      }
      //如果newLen > oldLen则有新节点需要挂载
      if (newLen > oldLen) {
        for (let i = commonLength; i < newLen; i++) {
          patch(null, newChildren[i], container)
        }
      } else if (oldLen > newLen) {//说明要卸载
        for (let i = commonLength; i < oldLen; i++) {
          unmount(oldChildren[i])
        }
      }
    } else {
      //此时旧节点要么是文本节点，要么不存在。
      //我们做的都是将容器清空，然后挂载新的一组子节点。
      setElementText(container, '')
      n2.children.forEach(c => patch(null, n2, container))
    }
  } else {
    //省略部分代码
  }
}
```
# DOM复用与key的作用
上述代码仍然存在可以优化的空间。
看下面代码：
```javascript
//oldchildren
[
    {type:'p'},
    {type:'span'},
    {type:'div'}
]
//newchildren
[
    {type:'span'},
    {type:'div'},
    {type:'p'}
]
```
如果按上述代码来进行子节点更新，我们需要进行六次DOM操作，才能完成更新，但是我们可以看到的是上述子节点只是顺序不同，我们只需要改变子节点的顺序即可。
当然有一个前提：**我们必须确定新的子节点出现在了旧的子节点中**，那我们如何判断呢，**此时我们就可以引用额外的key来作为vnode的标识**。
如下：
```javascript
//oldchildren
[
    {type:'p',children:'1',key:'1'},
    {type:'span',children:'2',key:'2'},
    {type:'div',children:'3',key:'3'}
]
//newchildren
[
    { type: 'div', children: '3', key: '3' },
    { type: 'span', children: '2', key: '2' },
    { type: 'p', children: '1', key: '1' }
]
```
有key的话，我们就可以知道新节点与子节点的映射关系，也就知道如何去移动子节点。
 但是即使DOM 可以复用，也不意味着我们不需要进行更新，**再讨论DOM如何移动之前，我们需要完成打补丁操作**。
# 找到需要移动的元素
我们通过key值找到可以复用的元素后，我们需要解决如何判断一个元素需要移动，以及如何移动。
我们先来解决一个元素是否需要移动的问题。
逆向思考，当新旧节点中节点顺序不变时，就不需要移动。
举例：
![屏幕截图 2024-04-13 112908.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1712978988394-f3831a79-678f-4102-a813-d9f32ee634e3.png#averageHue=%23e7e7e7&clientId=ua0ceb1b2-a420-4&from=ui&id=u19c42040&originHeight=295&originWidth=512&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=23345&status=done&style=none&taskId=u88d1040e-c695-402e-abe1-30ebf5a98c4&title=)
每次寻找可复用的节点，都会记录复用节点再旧的一组节点的位置索引，将位置索引按先后排序，我们得到0，1，2.这是一个递增序列，我们不需要移动任何节点。
![屏幕截图 2024-04-13 113454.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1712979281933-7d5ebd80-c7a2-40ce-a022-ed4c51d2d54e.png#averageHue=%23e6e6e6&clientId=ua0ceb1b2-a420-4&from=ui&id=u32a3ff44&originHeight=296&originWidth=537&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=32907&status=done&style=none&taskId=u78e40d0a-9906-4524-b17f-003c3be39f3&title=)
上图中序列为：2，0，1。不具有递增趋势，我们需要移动节点。
我们将p-3在旧节点中的索引定义为：在寻找相同key值的节点中遇到的最大索引值。如果存在比当前索引值比当前遇到的最大索引值还要小的节点，则以为着该节点需要移动。
# 移动元素
我们如果要移动元素（节点就要获得DOM的引用），我们知道DOM的引用是存储在它的vnode.el中的。
同时当更新操作发生时，渲染器会调用pathElement,其中一段代码如下：
```javascript
export default function pathElement(n2, n1) {
    const el = n2.el = n1.el
  //
}
```
**这段代码实现了将旧节点的el属性赋值给了新节点，这样新节点也获得了对DOM的引用**。
如何移动：
我们都知道，新节点的顺序就是更新后真实DOM的顺序，我们只需要将新节点对应的对应真实DOM的引用移到它前一个新节点的位置。
![屏幕截图 2024-04-13 143149.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1712989896123-12fc195a-3952-46fa-ad54-88b3ab33002e.png#averageHue=%23efefef&clientId=uea38da29-fe96-4&from=ui&id=u8d0d35b3&originHeight=531&originWidth=625&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=73241&status=done&style=none&taskId=ud9e57af5-9b35-4c14-89b3-e74a119e5ed&title=)
代码实现：
```javascript
function pathChildren(n1, n2, container) {
    //判断新子节点是否是文本节点
    if (typeof n2.children === 'string') {
        //省略部分代码
    } else if (Array.isArray(n2.children)) {
        //判断旧节点是否也是一组子节点
        if (Array.isArray(n1.children)) {
            const oldChildren = n1.children
            const newChildren = n2.children

            let lastIndex = 0
            for(let i = 0;i < newChildren.length;i++){
                const newVNode = newChildren[i]
                let j = 0
                for(j;j < oldChildren.length;j++){
                    const oldVNode = oldChildren[j]
                    if(newVNode.key === oldVNode.key){
                        patch(oldVNode,newVNode,container)
                        if(j < lastIndex){
                            //代码运行到这里，说明newVNode 对应的真实DOM需要移动
                            //先获取newVNode的前一个vnode，即container
                            const preVNode = newChildren[i - 1]
                            if(preVNode){
                                //如果preVNode不存在的话，则说明当前节点是第一个节点，它不需要移动
                                //如果存在，我们应先获取preVNode的下一个兄弟节点
                                const anchor = preVNode.el.nextSibling
                                //调用insert插入
                                insert(newVNode,container,anchor)
                            }
                        }else{
                            lastIndex = j
                        }
                        break
                    }
                }
            }
        } else {
            //省略部分代码
        }
    }
}
```
# 添加新元素
想办法找到新增节点，同时将新增节点挂载到正确位置。
定义一个find，来判断是否有找到可复用节点
```javascript
function pathChildren(n1, n2, container) {
    //判断新子节点是否是文本节点
    if (typeof n2.children === 'string') {
        //省略部分代码
    } else if (Array.isArray(n2.children)) {
        //判断旧节点是否也是一组子节点
        if (Array.isArray(n1.children)) {
            const oldChildren = n1.children
            const newChildren = n2.children

            let lastIndex = 0
            for (let i = 0; i < newChildren.length; i++) {
                const newVNode = newChildren[i]
                let j = 0
                //设置find变量，代表是否找到可复用的节点
                let find = false
                for (j; j < oldChildren.length; j++) {
                    const oldVNode = oldChildren[j]
                    if (newVNode.key === oldVNode.key) {
                        //一旦找到可复用节点则将find的值设为true
                        find = true
                        patch(oldVNode, newVNode, container)
                        if (j < lastIndex) {
                            //代码运行到这里，说明newVNode 对应的真实DOM需要移动
                            //先获取newVNode的前一个vnode，即container
                            const preVNode = newChildren[i - 1]
                            if (preVNode) {
                                //如果preVNode不存在的话，则说明当前节点是第一个节点，它不需要移动
                                //如果存在，我们应先获取preVNode的下一个兄弟节点
                                const anchor = preVNode.el.nextSibling
                                //调用insert插入
                                insert(newVNode, container, anchor)
                            }
                        } else {
                            lastIndex = j
                        }
                        break
                    }
                    //代码运行到这里，如果find认为false
                    //说明没有找到可复用的节点
                    //也就是说该节点是新增节点，需要挂载
                    if(!find){
                        //为了挂载到正确位置，我们需要获取锚点
                        const preVNode = newChildren[i - 1]
                        let anchor = null
                        if(preVNode){
                            //如果存在，则将它下一个兄弟节点作为锚点 
                            anchor = preVNode.el.nextSibling
                        }else{
                            //如果没有前一个元素，说明它是第一个子节点
                            anchor = container.firstChild
                        }
                        patch(null,newVNode,container,anchor)
                    }
                }
            }
        } else {
            //省略部分代码
        }
    }
}
```
# 移除不存在元素
当旧节点中存在新节点中不存在的元素，更新完成时，不能存在节点的引用仍然存在，我们需要增加额外的节点来删除遗留节点。
思路很简单：**当所用更新完成时，我们需要遍历一遍旧节点，再去新节点中寻找具有相同key值的节点。如果找不到，则说明需要删除该节点**。
```javascript
function pathChildren(n1, n2, container) {
    //判断新子节点是否是文本节点
    if (typeof n2.children === 'string') {
        //省略部分代码
    } else if (Array.isArray(n2.children)) {
        //判断旧节点是否也是一组子节点
        if (Array.isArray(n1.children)) {
            const oldChildren = n1.children
            const newChildren = n2.children

            let lastIndex = 0
            for (let i = 0; i < newChildren.length; i++) {
                const newVNode = newChildren[i]
                let j = 0
                //设置find变量，代表是否找到可复用的节点
                let find = false
                for (j; j < oldChildren.length; j++) {
                    const oldVNode = oldChildren[j]
                    if (newVNode.key === oldVNode.key) {
                        //一旦找到可复用节点则将find的值设为true
                        find = true
                        patch(oldVNode, newVNode, container)
                        if (j < lastIndex) {
                            //代码运行到这里，说明newVNode 对应的真实DOM需要移动
                            //先获取newVNode的前一个vnode，即container
                            const preVNode = newChildren[i - 1]
                            if (preVNode) {
                                //如果preVNode不存在的话，则说明当前节点是第一个节点，它不需要移动
                                //如果存在，我们应先获取preVNode的下一个兄弟节点
                                const anchor = preVNode.el.nextSibling
                                //调用insert插入
                                insert(newVNode, container, anchor)
                            }
                        } else {
                            lastIndex = j
                        }
                        break
                    }
                    //代码运行到这里，如果find认为false
                    //说明没有找到可复用的节点
                    //也就是说该节点是新增节点，需要挂载
                    if (!find) {
                        //为了挂载到正确位置，我们需要获取锚点
                        const preVNode = newChildren[i - 1]
                        let anchor = null
                        if (preVNode) {
                            //如果存在，则将它下一个兄弟节点作为锚点 
                            anchor = preVNode.el.nextSibling
                        } else {
                            //如果没有前一个元素，说明它是第一个子节点
                            anchor = container.firstChild
                        }
                        patch(null, newVNode, container, anchor)
                    }
                }
            }
            //上一步更新完成后
            //遍历旧的一组子节点
            for(let i = 0;i < oldChildren.length;i++){
                const oldVNode = oldChildren[i]
                //去寻找具有相同key值，在新节点中
                const has = newChildren.find(
                    vnode => vnode.key === oldVNode.key
                )
                if(!has){
                    //如果没有就删除
                    unmount(oldVNode)
                }
            }
        } else {
            //省略部分代码
        }
    }
}
```
