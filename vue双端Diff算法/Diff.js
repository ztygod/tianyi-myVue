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