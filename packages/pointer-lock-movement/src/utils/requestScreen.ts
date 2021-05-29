let screenElement: HTMLElement | undefined

export function requestScreen (
    customScreen?: DOMRect | HTMLElement | Partial<CSSStyleDeclaration>,
    { zIndex} : { zIndex?: number } = {}
): { width: number, height: number, x: number, y: number } {
    if (!customScreen) {
        return { width: window.innerWidth, height: window.innerHeight, x: 0, y: 0 }
    }

    if (customScreen instanceof DOMRect) {
        return { width: customScreen.width, height: customScreen.height, x: customScreen.x, y: customScreen.y }
    }

    const screenEl = customScreen instanceof HTMLElement ? customScreen : document.createElement('div')

    if (typeof customScreen === 'object' && customScreen !== null && !(customScreen instanceof HTMLElement)) {
        Object.assign(screenEl.style, customScreen)
    }

    screenEl.style.position = 'fixed'
    screenEl.style.display = 'flex'
    screenEl.style.alignItems = 'center'
    screenEl.style.justifyContent = 'center'
    screenEl.style.top = screenEl.style.top ||  '0px'
    screenEl.style.left = screenEl.style.left || '0px'
    screenEl.style.width = screenEl.style.width || '0px'
    screenEl.style.height = screenEl.style.height || '0px'

    if (zIndex !== undefined) {
        screenEl.style.zIndex = zIndex.toString()
    }

    screenElement = screenEl
    document.body.appendChild(screenEl)

    const { width, height, x, y } = screenEl.getBoundingClientRect()

    return { width, height, x, y }
}

export function clearScreen (): void {
    screenElement?.remove()
    screenElement = undefined
}