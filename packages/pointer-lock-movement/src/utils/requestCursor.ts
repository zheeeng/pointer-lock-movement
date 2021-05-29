let cursorElement: HTMLElement | undefined

export function requestCursor (
    customCursor?: string | HTMLElement | Partial<CSSStyleDeclaration>,
    { zIndex} : { zIndex?: number } = {}
): HTMLElement {
    const cursorEl = customCursor instanceof HTMLElement ? customCursor : document.createElement('div')

    cursorEl.textContent = typeof customCursor === 'string' ? customCursor : ''

    if (typeof customCursor === 'object' && customCursor !== null && !(customCursor instanceof HTMLElement)) {
        Object.assign(cursorEl.style, customCursor)
    }

    cursorEl.style.position = 'fixed'
    cursorEl.style.display = 'flex'
    cursorEl.style.alignItems = 'center'
    cursorEl.style.justifyContent = 'center'
    cursorEl.style.top = '0px'
    cursorEl.style.left = '0px'
    cursorEl.style.width = cursorEl.style.width || '0px'
    cursorEl.style.height = cursorEl.style.height || '0px'

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