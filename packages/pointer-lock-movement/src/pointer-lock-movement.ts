// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./shim.d.ts" />

import { requestScreen, clearScreen } from './utils/requestScreen'
import { requestCursor, clearCursor } from './utils/requestCursor'

export type MoveState = {
    status: 'moving' | 'stopped',
    movementX: number,
    movementY: number,
    offsetX: number,
    offsetY: number,
}

export type PointerLockMovementOption = {
    onLock?: (locked: boolean) => void,
    onMove?: (event: MouseEvent, moveState: MoveState) => void,
    cursor?: string | HTMLElement | Partial<CSSStyleDeclaration>,
    screen?: DOMRect | HTMLElement | Partial<CSSStyleDeclaration>,
    zIndex?: number,
    loopBehavior?: 'loop' | 'stop' | 'infinite',
    trigger?: 'drag' | 'toggle',
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
        movementX: number,
        movementY: number,
        maxWidth: number,
        maxHeight: number
    }

    const move: CoData<MoveContext, MouseEvent> = (context, effect) => payload => {
        context.event = payload
        context.movementX = payload.movementX
        context.movementY = payload.movementY
        context.x += context.movementX
        context.y += context.movementY
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

        function deActive () {
            exitPointerLock()

            option?.onLock?.(false)
            document.removeEventListener('mousemove', handleMouseMove)

            nextFn = undefined
            clearCursor()
            clearScreen()
        }

        function active () {
            const virtualScreen = requestScreen(option?.screen, { zIndex: option?.zIndex })

            const virtualCursor = requestCursor(option?.cursor, { zIndex: option?.zIndex })

            nextFn = event => move(
                {
                    event,
                    moveStatus: 'moving',
                    startX: event.clientX,
                    startY: event.clientY,
                    movementX: 0,
                    movementY: 0,
                    x: event.clientX - virtualScreen.x,
                    y: event.clientY - virtualScreen.y,
                    maxWidth: virtualScreen.width,
                    maxHeight: virtualScreen.height,
                },
                ({ event, moveStatus, x, y, startX, startY, movementX, movementY }) => {
                    virtualCursor.style.transform = `translate3D(${x}px, ${y}px, 0px)`

                    option?.onMove?.(
                        event,
                        {
                            status: moveStatus,
                            offsetX: x - startX,
                            offsetY: y - startY,
                            movementX,
                            movementY,
                        }
                    )
                }
            )(event)

            document.addEventListener('mousemove', handleMouseMove)

            document.addEventListener('pointerlockchange', function handlePointerLockChange () {
                if (isLocked()) {
                    return
                }

                document.removeEventListener('pointerlockchange', handlePointerLockChange)
                deActive()
            })

            option?.onLock?.(true)
            requestPointerLock()
        }

        function handleMouseMove (event: MouseEvent) {
            nextFn = nextFn?.(event)
        }

        function handleDeActive () {
            if (!isLocked()) {
                return
            }
    
            deActive()
        }

        function handleActive () {
            if (isLocked()) {
                return
            }

            active()
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
            element.addEventListener('pointerdown', handleActive)
            element.addEventListener('pointerup', handleDeActive)

            return () => {
                element.removeEventListener('pointerdown', handleActive)
                element.removeEventListener('pointerup', handleDeActive)
            }
        } else {
            element.addEventListener('pointerdown', handleToggleActive)

            return () => {
                element.removeEventListener('pointerdown', handleToggleActive)
            }
        }
    
    }

    return startup()
}