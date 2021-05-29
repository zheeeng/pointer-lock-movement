// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./shim.d.ts" />

import { requestScreen, clearScreen } from './utils/requestScreen'
import { requestCursor, clearCursor } from './utils/requestCursor'

export type PointerLockMovementOption = {
    onLock?: (locked: boolean) => void,
    onMove?: (event: MouseEvent, moveState: { status: 'moving' | 'stopped', offsetX: number, offsetY: number }) => void,
    cursor?: string | HTMLElement | Partial<CSSStyleDeclaration>,
    screen?: DOMRect | HTMLElement | Partial<CSSStyleDeclaration>,
    zIndex?: number,
    loopBehavior?: 'loop' | 'stop' | 'infinite',
    trigger?: 'drag' | 'click',
}

type Iteration<Payload> = (payload: Payload) => Iteration<Payload>

export type CoData<
    Context extends Record<string, unknown>,
    Payload,
> = (context: Context, effect: (context: Context) => void) => Iteration<Payload>

export function isSupportPointerLock () {
    return 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document
}

function assertSupportPointerLock () {
    if (isSupportPointerLock()) {
        return
    }

    throw new Error('Your browser does not support pointer lock')
}

export const pointerLockMovement = (
    element: Element,
    {
        loopBehavior = 'loop',
        trigger = 'drag',
        zIndex = 99999,
        ...customOption
    }: PointerLockMovementOption = {}
) => {
    const option = { ...customOption, loopBehavior, trigger, zIndex }

    function requestPointerLock () {
        (element.requestPointerLock ?? element.mozRequestPointerLock ?? element.webkitRequestPointerLock).call(element)
    }

    function exitPointerLock () {
        (document.exitPointerLock ?? document.mozExitPointerLock ?? document.webkitExitPointerLock).call(document)
    }

    function isLocked () {
        return element === document.pointerLockElement || element === document.mozPointerLockElement || element === document.webkitPointerLockElement
    }

    type MoveContext = {
        event: MouseEvent,
        moveStatus: 'moving' | 'stopped',
        startX: number,
        startY: number,
        x: number,
        y: number,
        maxWidth: number,
        maxHeight: number
    }

    const move: CoData<MoveContext, MouseEvent> = (context, effect) => payload => {
        context.event = payload
        context.x += payload.movementX
        context.y += payload.movementY
        context.moveStatus = 'moving'

        if (option?.loopBehavior === 'loop') {
            if (context.x > context.maxWidth) {
                context.x -= context.maxWidth
            } else if (context.x < 0) {
                context.x += context.maxWidth
            }
    
            if (context.y > context.maxHeight) {
                context.y -= context.maxHeight
            } else if (context.y < 0) {
                context.y += context.maxHeight
            }
        } else if (option?.loopBehavior === 'stop') {
            if (context.x > context.maxWidth) {
                context.x = context.maxWidth
                context.moveStatus = 'stopped'
            } else if (context.x < 0) {
                context.x = 0
                context.moveStatus = 'stopped'
            }
    
            if (context.y > context.maxHeight) {
                context.y = context.maxHeight
                context.moveStatus = 'stopped'
            } else if (context.y < 0) {
                context.y = 0
                context.moveStatus = 'stopped'
            }
        }

        effect(context)

        return move(context, effect)
    }

    function startup () {
        let nextFn: Iteration<MouseEvent> | undefined

        function handleMouseMove (event: MouseEvent) {
            nextFn = nextFn?.(event)
        }

        function handleActive () {
            if (isLocked()) {
                return
            }

            const virtualScreen = requestScreen(option?.screen, { zIndex: option?.zIndex })

            const virtualCursor = requestCursor(option?.cursor, { zIndex: option?.zIndex })

            nextFn = event => move(
                {
                    event,
                    moveStatus: 'moving',
                    startX: event.clientX,
                    startY: event.clientY,
                    x: event.clientX - virtualScreen.x,
                    y: event.clientY - virtualScreen.y,
                    maxWidth: virtualScreen.width,
                    maxHeight: virtualScreen.height,
                },
                ({ event, moveStatus, x, y, startX, startY }) => {
                    virtualCursor.style.transform = `translate3D(${x}px, ${y}px, 0px)`

                    option?.onMove?.(event, { status: moveStatus, offsetX: x - startX, offsetY: y - startY })
                }
            )(event)

            document.addEventListener('mousemove', handleMouseMove)

            option?.onLock?.(true)

            requestPointerLock()
        }
    
        function handleDeActive () {
            if (!isLocked()) {
                return
            }
    
            exitPointerLock()

            option?.onLock?.(false)
            document.removeEventListener('mousemove', handleMouseMove)

            nextFn = undefined
            clearCursor()
            clearScreen()
        }

        function handleToggleActive () {
            if (isLocked()) {
                handleDeActive()
            } else {
                handleActive()
            }
        }
    
        assertSupportPointerLock()

        if (option?.trigger === 'drag') {
            element.addEventListener('mousedown', handleActive)
            element.addEventListener('mouseup', handleDeActive)
            element.addEventListener('touchstart', handleActive)
            element.addEventListener('touchend', handleDeActive)
        
            return () => {
                element.removeEventListener('touchend', handleDeActive)
                element.removeEventListener('touchstart', handleActive)
                element.removeEventListener('mouseup', handleDeActive)
                element.removeEventListener('mousedown', handleActive)
            }
        } else {
            element.addEventListener('click', handleToggleActive)
            element.addEventListener('touchstart', handleToggleActive)

            return () => {
                element.removeEventListener('click', handleToggleActive)
                element.removeEventListener('touchstart', handleToggleActive)
            }
        }
    
    }

    return startup()
}