function Watch(source, cb) {
    //定义getter
    let getter
    //如果source是函数，则说明用户传的是getter，直接把source赋值给getter
    if (typeof source == 'function') {
        getter = source
    } else {
        //否则调用traverse递归读取
        getter = () => traverse(source)
    }

    let oldValue, newValue
    const effectFn = effect(
        () => getter(),
        {
            lazy: true,
            scheduler() {
                //重新执行副作用函数，得到新值
                newValue = effectFn()
                //将新值与旧值传入回调函数
                cb(newValue, oldValue)
                //更新旧值
                oldValue = newValue
            }
        }
    )
    //第一次执行得到的值
    oldValue = effectFn()
}

function traverse(value, seen = new Set()) {
    //如果要读取值是原始值或者已经被读取过，那么什么都不做
    if (typeof value !== 'object' || value === null || seen.has(value)) {
        return
    }
    //代表读取过了
    seen.add(value)
    for (const k in value) {
        traverse(value[k], seen)
    }
    return value
}
