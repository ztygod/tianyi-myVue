function computed(getter) {
    let value

    let dirty
    //将getter作为副作用函数
    const effectFn = effect(getter, {
        lazy: true,
        scheduler() {
            if (!dirty) {
                dirty = true
                trigger(obj, 'value')
            }
        }
    })
    const obj = {
        //当读取value才执行effectFn
        get value() {
            if (dirty) {
                value = effectFn
                dirty = false
            }
            track(obj, 'value')
            return value
        }
    }
    return obj
}
