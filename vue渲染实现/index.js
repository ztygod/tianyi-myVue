import createRenderer from "./createRenderer";


const vnode = {
    type: 'div',
    props: {
        onClick: () => {
            alert('父元素clicked')
        },
        class: [
            'foo bar',
            {
                bax: true
            }
        ],
        disabled: true,
        children: [
            {
                type: 'p',
                props: {
                    onClick: () => {
                        bol.value = true
                    }
                },
                children: 'text'
            }
        ]
    }
}
const container = document.querySelector('#app')

const renderer = createRenderer()
renderer.render(vnode, container)