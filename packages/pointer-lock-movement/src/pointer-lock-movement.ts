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
    onMove?: (event: PointerEvent, moveState: MoveState) => void,
    cursor?: string | HTMLElement | Partial<CSSStyleDeclaration>,
    screen?: DOMRect | HTMLElement | Partial<CSSStyleDeclaration>,
    zIndex?: number,
    loopBehavior?: 'loop' | 'stop' | 'infinite',
    trigger?: 'drag' | 'toggle',
    dragOffset?: number,
    disableOnActiveElement?: number,
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
        event: PointerEvent,
        status: 'moving' | 'stopped',
        startX: number,
        startY: number,
        x: number,
        y: number,
        movementX: number,
        movementY: number,
        maxWidth: number,
        maxHeight: number
    }

    const move: CoData<MoveContext, PointerEvent> = (context, effect) => payload => {
        context.event = payload
        context.movementX = payload.movementX
        context.movementY = payload.movementY
        context.x += context.movementX
        context.y += context.movementY
        context.status = 'moving'

        if (option.loopBehavior === 'loop') {
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
        } else if (option.loopBehavior === 'stop') {
            if (context.x > context.maxWidth) {
                context.x = context.maxWidth
                context.status = 'stopped'
            } else if (context.x < 0) {
                context.x = 0
                context.status = 'stopped'
            }
    
            if (context.y > context.maxHeight) {
                context.y = context.maxHeight
                context.status = 'stopped'
            } else if (context.y < 0) {
                context.y = 0
                context.status = 'stopped'
            }
        }

        effect(context)

        return move(context, effect)
    }

    function startup () {
        let nextFn: Iteration<PointerEvent> | undefined

        const localState = {
            targetOnActiveElement: false,
            startX: 0,
            startY: 0,
        }

        function detectMoveOffset (event: Event) {
            if (!(event instanceof PointerEvent) || !event.buttons || !option.dragOffset) {
                return
            }

            const offset = Math.sqrt(Math.pow(event.clientX - localState.startX, 2) + Math.pow(event.clientY - localState.startY, 2))

            if (offset < option.dragOffset) {
                return
            }

            element.removeEventListener('pointermove', detectMoveOffset)

            active(event)
        }

        function deActive () {
            exitPointerLock()

            option.onLock?.(false)
            document.removeEventListener('pointermove', handlePointerMove)
            document.removeEventListener('pointermove', detectMoveOffset)

            nextFn = undefined
            clearCursor()
            clearScreen()
        }

        function handlePointerMove (event: PointerEvent) {
            if (option.trigger === 'drag' && !event.buttons) {
                deActive()
            } else {
                handleContinueMove(event)
            }
        }

        function active (pointerEvent: PointerEvent) {
            const virtualScreen = requestScreen(option.screen, { zIndex: option.zIndex })

            const virtualCursor = requestCursor(option.cursor, { zIndex: option.zIndex })

            nextFn = move(
                {
                    event: pointerEvent,
                    status: 'moving',
                    startX: pointerEvent.clientX,
                    startY: pointerEvent.clientY,
                    movementX: 0,
                    movementY: 0,
                    x: pointerEvent.clientX - virtualScreen.x,
                    y: pointerEvent.clientY - virtualScreen.y,
                    maxWidth: virtualScreen.width,
                    maxHeight: virtualScreen.height,
                },
                ({ event, status, x, y, startX, startY, movementX, movementY }) => {
                    virtualCursor.style.transform = `translate3D(${x}px, ${y}px, 0px)`

                    option.onMove?.(
                        event,
                        {
                            status,
                            offsetX: x - startX,
                            offsetY: y - startY,
                            movementX,
                            movementY,
                        }
                    )
                }
            )(pointerEvent)

            document.addEventListener('pointermove', handlePointerMove)

            document.addEventListener('pointerlockchange', function handlePointerLockChange () {
                if (isLocked()) {
                    return
                }

                document.removeEventListener('pointerlockchange', handlePointerLockChange)
                deActive()
            })

            option.onLock?.(true)
            requestPointerLock()
        }

        function handleContinueMove (event: PointerEvent) {
            nextFn = nextFn?.(event)
        }

        function handleDeActive () {
            if (!isLocked()) {
                return
            }
    
            deActive()
        }

        function handleActive (event: Event) {
            if (localState.targetOnActiveElement && option.disableOnActiveElement) {
                return
            }

            if (!(event instanceof PointerEvent) || event.button !== 0) {
                return
            }

            if (isLocked()) {
                return
            }

            active(event)
        }

        function handleToggleActive (event: Event) {
            if (!(event instanceof PointerEvent) || event.button !== 0) {
                return
            }

            if (isLocked()) {
                handleDeActive()
            } else {
                handleActive(event)
            }
        }

        function handleActiveUntilDragOffset (event: Event) {
            if (localState.targetOnActiveElement && option.disableOnActiveElement) {
                return
            }

            if (!(event instanceof PointerEvent) || event.button !== 0 || !option.dragOffset) {
                return
            }

            if (isLocked()) {
                return
            }

            localState.startX = event.clientX
            localState.startY = event.clientY

            element.addEventListener('pointermove', detectMoveOffset)
        }

        function markElementIsActiveElement (event: Event) {
            if (!(event instanceof PointerEvent) || event.button !== 0 || !option.disableOnActiveElement) {
                return
            }

            if (event.target === document.activeElement) {
                localState.targetOnActiveElement = true
            } else {
                localState.targetOnActiveElement = false
            }
        }
    
        assertSupportPointerLock()

        if (option.disableOnActiveElement) {
            element.addEventListener('pointerdown', markElementIsActiveElement, { capture: true })
        }

        if (option.trigger === 'drag') {
            if (option.dragOffset) {
                element.addEventListener('pointerdown', handleActiveUntilDragOffset)
                document.addEventListener('pointerup', handleDeActive)

                return () => {
                    element.removeEventListener('pointermove', handleActiveUntilDragOffset)
                    document.removeEventListener('pointerup', handleDeActive)
                    element.removeEventListener('pointerdown', markElementIsActiveElement, { capture: true })
                }
            }

            element.addEventListener('pointerdown', handleActive)
            document.addEventListener('pointerup', handleDeActive)

            return () => {
                element.removeEventListener('pointerdown', handleActive)
                document.removeEventListener('pointerup', handleDeActive)
                element.removeEventListener('pointerdown', markElementIsActiveElement, { capture: true })
            }
        } else {
            element.addEventListener('pointerdown', handleToggleActive)

            return () => {
                element.removeEventListener('pointerdown', handleToggleActive)
                element.removeEventListener('pointerdown', markElementIsActiveElement, { capture: true })
            }
        }
    
    }

    return startup()
}
