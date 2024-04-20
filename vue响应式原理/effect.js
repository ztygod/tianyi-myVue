let activeEffect
//effect栈
const effectStack = []

function effect(fn, options = {}) {
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = fn
        //在调用副作用函数之前将当前副作用函数压入栈中
        effectStack.push(effectFn)
        const res = fn()
        //在副作用函数执行完后，将执行过的副作用函数弹出栈，并将activeEffect还原为之前的值
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
        //将res作为effectFn的返回值
        return res
    }
    effectFn.options = options
    // activeEffect.deps 用来存储所有与该副作用函数相关联的依赖集合
    effectFn.deps = []
    //只有非lazy时才执行
    if (!options.lazy) {
        effectFn()
    }
    return effectFn
}

function cleanup() {
    for (let i = 0; i < effectFn.deps.length; i++) {
        const deps = effectFn.deps[i]
        deps.delete(effectFn)
    }
    effectFn.deps.length = 0
}