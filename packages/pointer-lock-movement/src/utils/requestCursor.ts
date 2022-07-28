let cursorElement: HTMLElement | undefined

export function requestCursor (
    customCursor?: string | HTMLElement | Partial<CSSStyleDeclaration>,
    { zIndex} : { zIndex?: number } = {}
): HTMLElement {
    const cursorEl = document.createElement('div')
    const cursorChildWrapper = document.createElement('div')
    cursorEl.appendChild(cursorChildWrapper)

    if (customCursor instanceof HTMLElement) {
        cursorChildWrapper.appendChild(customCursor)
    } else if (typeof customCursor === 'string') {
        cursorChildWrapper.textContent = customCursor
    } else if (typeof customCursor === 'object' && customCursor !== null) {
        Object.assign(cursorChildWrapper.style, customCursor)
    }

    cursorEl.style.position = 'fixed'
    cursorEl.style.top = '0px'
    cursorEl.style.left = '0px'

    cursorChildWrapper.style.transform = 'translate(-50%, -50%)'

    if (zIndex !== undefined) {
        cursorEl.style.zIndex = zIndex.toString()
    }

    cursorElement = cursorEl
    document.body.appendChild(cursorEl)

    return cursorEl
}

export function clearCursor (): void {
    cursorElement?.remove()
    cursorElement = undefined
}