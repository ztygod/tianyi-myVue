import patchProps from "./patchProps"


export default function mountElement(vnode, container, anchor) {
    //让vnode.el引用真实DOM元素
    const el = vnode.el = createElement(vnode.type)
    if (typeof vnode.children == 'string') {
        el.textContent = vnode.children
    } else if (Array.isArray(vnode.children)) {
        vnode.forEach(child => {
            patch(null, child, el)
        })
    }
    if (vnode.props) {
        for (const key in vnode.props) {
            patchProps(el, key, null, vnode.props[key])
        }
    }
    insert(el, container, anchor)
}