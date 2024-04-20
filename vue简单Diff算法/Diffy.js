import unmount from "../vue渲染实现/unmount"

//oldchildren
[
    { type: 'p', children: '1', key: '1' },
    { type: 'span', children: '2', key: '2' },
    { type: 'div', children: '3', key: '3' }
]
//newchildren
[
    { type: 'div', children: '3', key: '3' },
    { type: 'span', children: '2', key: '2' },
    { type: 'p', children: '1', key: '1' }
]

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
            for (let i = 0; i < oldChildren.length; i++) {
                const oldVNode = oldChildren[i]
                //去寻找具有相同key值，在新节点中
                const has = newChildren.find(
                    vnode => vnode.key === oldVNode.key
                )
                if (!has) {
                    //如果没有就删除
                    unmount(oldVNode)
                }
            }
        } else {
            //省略部分代码
        }
    }
}