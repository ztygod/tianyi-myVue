function trigger(target, key) {
    const depsMap = bucket.get(target)
    if (!depsMap) {
        return
    }
    const effects = depsMap.get(key)

    const effectToRun = new Set()
    effects && effects.forEach(effectFn => {
        //如果trigger触发执行的副作用函数与当前正在执行的副作用函数相同则不执行
        if (effectFn != activeEffect) {
            effectToRun.add(effectFn)
        }
    })
    effectToRun.forEach(effectFn => {
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}