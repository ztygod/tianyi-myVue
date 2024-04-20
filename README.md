# vue日志
### 1.vue响应式原理 更新于2024.04.02
![概述](https://github.com/ztygod/tianyi-myvue/assets/142967939/3fc9d048-1b12-40dd-b1b5-87d6494ea88d)
### 2.vue的渲染过程的实现 更新于2024.04.09
![概述](https://github.com/ztygod/tianyi-myvue/assets/142967939/b7454baf-4251-450c-9292-600e3a52c963)
### 3.简单Diff算法 更新于2024.04.13
![概述](https://github.com/ztygod/tianyi-myvue/assets/142967939/1bf5dca9-f6c8-4066-8f24-2302497b37bc)
实现vue中简单的Diff算法

Diff算法主要出现在新旧节点都为一组节点时

在渲染器中用来减少过多DOM操作引起的性能消耗
```
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
### 4.双端Diff算法 更新于2024.04.20
![概述](https://github.com/ztygod/tianyi-myvue/assets/142967939/d21d83f4-1638-49d0-b5d1-86d2a56cdcbc)
代码如下
```
function pathChildren(n1, n2, container) {
    if (typeof n2.children === 'string') {
        //省略部分代码
    } else if (Array.isArray(n2.children)) {
        if (Array.isArray(n1.children)) {
            //封装pathKeyChildren函数处理两组节点
            pathKeyChildren(n1, n2, container)
        }
    } else {
        //省略部分代码
    }
}

function pathKeyChildren(n1, n2, container) {
    const oldChildren = n1.children
    const newChildren = n2.children
    //四个索引值
    let oldStartIdx = 0
    let oldEndIdx = oldChildren.length - 1
    let newStartIdx = 0
    let newEndIdx = newChildren.length - 1
    //四个索引指向vnode节点
    let oldStartVNode = oldChildren[oldStartIdx]
    let oldEndVNode = oldChildren[oldEndIdx]
    let newStartVNode = newChildren[newStartIdx]
    let newEndVNode = newChildren[newEndIdx]

    //核心部分
    while (newStartIdx <= newEndIdx && oldStartIdx <= oldEndIdx) {
        if (!oldStartIdx) {
            //如果头部节点为undefined,则是已经被处理过，直接跳到下一个位置
            oldStartVNode = oldChildren[++oldStartIdx]
        } else if (!oldEndVNode) {
            oldEndVNode = oldChildren[--oldEndIdx]
        } else if (oldStartVNode.key === newStartVNode.key) {
            //第一步：oldStartVNode与newStartVNode比较
            patch(oldStartVNode, newStartVNode, container)
            //更新索引
            oldStartVNode = oldChildren[++oldStartIdx]
            newStartVNode = newChildren[++newStartIdx]
        } else if (oldEndVNode.key === newEndVNode.key) {
            //第二步：oldEndVNode与newEndVNode比较
            //都处于尾部，不需要移动，打补丁即可
            patch(oldEndVNode, newEndVNode, container)
            //更新索引
            oldEndVNode = oldChildren[--oldEndIdx]
            newEndVNode = newChildren[--newEndIdx]
        } else if (oldStartVNode.key === newEndVNode.key) {
            //第三步：oldStartVNode与newEndVNode比较
            //仍要更新节点
            patch(oldStartVNode, newEndVNode, container)
            //将旧节点中头子节点移动到尾子节点后面
            insert(oldStartVNode.el, container, oldEndVNode.el)
        } else if (oldEndVNode.key === newStartVNode.key) {
            //第四步：oldEndVNode与newStartVNode比较
            //仍要调用patch函数进行打补丁
            patch(oldEndVNode, newStartVNode, container)
            //移动DOM元素
            //oldEndVNode.el移到oldStartVNode.el前面
            insert(oldEndVNode.el, container, oldStartVNode.el)

            //移动之后更新索引值
            oldEndIdx = oldChildren[--oldEndIdx]
            newStartVNode = newChildren[++newStartIdx]
        } else {
            //非理想状况
            //遍历旧子节点，找到与newStartVNode拥有相同key值的元素
            const idxInOld = oldChildren.findIndex(
                node => node.key === newStartVNode.key
            )
            if (idxInOld > 0) {
                //说明找到了可复用的节点
                const vnodeToMove = oldChildren[idxInOld]
                //打补丁
                patch(vnodeToMove, newStartVNode, container)
                //移动
                insert(vnodeToMove.el, container, oldStartVNode.el)
                //设置为undefined
                oldChildren[idxInOld] = undefined
                //更新newStartVNode
                newStartVNode = newChildren[++newStartIdx]
            } else {
                //说明是添加了新元素
                //将newStartVNode作为新节点挂载到头部，用当前头节点作为锚点
                patch(null, newStartVNode, container, oldStartVNode.el)
            }
            newStartVNode = newChildren[++newStartIdx]
        }

    }
    //循环结束后检查索引值的情况
    if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
        //如果满足情况说明有新的节点没有挂载上去，需要挂载他们
        for (let i = newStartIdx; i <= newEndIdx; i++) {
            const anchor = newChildren[newEndIdx + 1] ? newChildren[newEndIdx + 1] : null
            patch(null, newChildren[i], container, anchor)
        }
    } else if (newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx) {
        //此时需要移除元素
        for (let i = oldStartIdx; i <= oldEndIdx; i++) {
            unmount(oldChildren[i])
        }
    }
}
更多内容请看我的博客[tianyi的博客](https://www.yuque.com/yuqueyonghupohswj/viohis)

