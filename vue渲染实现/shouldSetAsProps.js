export default function shouldSetAsProps(el, key, value) {
    //不止这一个，举例而已
    if (key === 'form' && el.tagName === 'INPUT') {
        return false
    }
    return key in el
}