// compatibility with old browsers
declare global {
    interface MouseEvent {
        mozMovementX: number
        mozMovementY: number
        webkitMovementX: number
        webkitMovementY: number
    }
    
    interface Document {
        mozPointerLockElement: Element
        webkitPointerLockElement: Element

        mozExitPointerLock(): void
        webkitExitPointerLock(): void

        addEventListener(type: 'pointerlockchange', listener: (event: Event) => void): void
        addEventListener(type: 'mozpointerlockchange', listener: (event: Event) => void): void
        addEventListener(type: 'webkitpointerlockchange', listener: (event: Event) => void): void

        removeEventListener(type: 'pointerlockchange', listener: (event: Event) => void): void
        removeEventListener(type: 'mozpointerlockchange', listener: (event: Event) => void): void
        removeEventListener(type: 'webkitpointerlockchange', listener: (event: Event) => void): void
    }

    interface Element {
        mozRequestPointerLock(): void
        webkitRequestPointerLock(): void
    }
}

export {}