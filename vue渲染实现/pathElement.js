//执行节点的更新操作

export default function pathElement(n2, n1) {
    const el = n2.el = n1.el
    const oldProps = n1.props
    const newProps = n2.props
    //第一步 更新props
    for (key in newProps) {
        if (newProps[key] !== oldProps[key]) {
            patchProps(el, key, oldProps[key], newProps[key])
        }
    }
    for (const key in oldProps) {
        if (!(key in newProps)) {
            patchProps(el, key, oldProps[key], null)
        }
    }
    //第二步，更新children
    pathChildren(n1, n2, el)
}

function pathChildren(n1, n2, container) {
    //判断新子节点是否是文本节点
    if (typeof n2.children === 'string') {
        //旧子节点有三种可能，文本节点，一组子节点，没有子节点
        //当只有旧节点为一组子节点时，才需要逐个卸载。
        if (Array.isArray(n1.children)) {
            n1.children.forEach((c) => unmount(c))
        }
        //最后设置新的文本节点
        setElementText(container, n2.children)
        //当新节点是一组子节点时
    } else if (Array.isArray(n2.children)) {
        //判断旧节点是否也是一组子节点
        if (Array.isArray(n1.children)) {
            //这里涉及核心的diff算法
        } else {
            //此时旧节点要么是文本节点，要么不存在。
            //我们做的都是将容器清空，然后挂载新的一组子节点。
            setElementText(container, '')
            n2.children.forEach(c => patch(null, n2, container))
        }
    } else {
        //代码执行到这里说明新节点不存在
        //我们要做的就是卸载而已
        if (Array.isArray(n1.children)) {
            //当是一组子节点时，我们需要遍历卸载
            n1.children.forEach(c => unmount(c))
        } else if (typeof n1.children === 'string') {
            setElementText(container, '')
        }
        //旧节点也不存在，那我们什么也不做    
    }
}