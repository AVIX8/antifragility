window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency])
    }

    let metas = [
        { httpEquiv: 'Content-Security-Policy', content: "default-src 'self'; script-src 'self'" },
        { httpEquiv: 'X-Content-Security-Policy', content: "default-src 'self'; script-src 'self'" },
    ]
    metas.forEach((data) => {
        let meta = document.createElement('meta')
        meta.httpEquiv = data.httpEquiv
        meta.content = data.content
        document.getElementsByTagName('head')[0].appendChild(meta)
    })
})
