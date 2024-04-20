//挂载标签属性，包括事件，class，属性
import shouldSetAsProps from "./shouldSetAsProps"


export default function patchProps(el, key, preValue, nextValue) {
    //判断是一个事件属性
    if (/^on/.test(key)) {
        //伪造的事件处理函数invokers，vei为vue event invoker
        const invokers = el._vei || (el._vei = {})
        //解决多个事件处理函数问题
        let invoker = invokers[key]
        const name = key.slice(2).toLowerCase()
        if (nextValue) {
            if (!invoker) {
                invoker = el._vei[key] = (e) => {
                    //如果事件的发生事件早于事件处理函数的绑定时间则不执行
                    if (e.timeStamp < invoker.attached) {
                        return
                    }
                    //如果invoker是一个数组，就遍历它，并逐个调用事件处理函数
                    if (Array.isArray(invoker.value)) {
                        invoker.value.forEach(fn => fn(e))
                    } else {
                        //否则直接进行函数调用
                        invoker.value(e)
                    }
                }
                invoker.value = nextValue
                invoker.attached = performance.now
                el.addEventListener(name, invoker)
            } else {
                //更新操作
                invoker.value = nextValue
            }
        } else if (invoker) {
            //移除事件处理函数
            el.removeEventListener(name, invoker)
        }
    }
    if (key === 'class') {
        el.className = nextValue || ''
    }
    if (shouldSetAsProps(el, key, value)) {
        const type = typeof el[key]
        if (type === 'boolean' && el[key] === '') {
            el[key] = true
        } else {
            el[key] = value
        }
    } else {
        //当是只读是，我们用el.setAttribute来设置属性
        el.setAttribute(key, value)
    }
}