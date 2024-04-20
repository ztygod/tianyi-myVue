import unmount from "./unmount"
import mountElement from "./mountElement"
import pathElement from "./pathElement"

export default function createRenderer() {
    function render(vnode, container) {
        if (vnode) {
            //新vnode存在，将其旧vnode传给patch函数，进行打补丁
            patch(container._vnode, vnode, container)
        } else {
            if (container._vnode) {
                //旧vnode存在但是新node不存在，说明是卸载操作
                unmount(container._vnode)
            }
        }
        container._vnode = vnode
    }
    function patch(n1, n2, container, anchor) {
        if (n1 && n1.type !== n2.type) {
            //新节点类型和旧节点类型不一样
            unmount(n1)
            n1 = null
        }

        const { type } = n2
        if (typeof type === 'string') {
            //新节点是普通节点，不是组件
            if (!n1) {
                //如果n1不存在，说明是挂载，则调用mountElement
                mountElement(n2, container, anchor)
            } else {
                //旧节点存在，执行更新操作
                pathElement(n1, n2)
            }
        } else if (typeof type === 'object') {
            //表示对象,节点是组件
        }
    }
    return render
}