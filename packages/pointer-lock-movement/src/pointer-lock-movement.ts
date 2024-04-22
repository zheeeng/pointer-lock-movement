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
    onPrepareLock?: (event: PointerEvent) => void,
    onCancelPrepareLock?: (event: PointerEvent) => void,
    onMove?: (event: PointerEvent, moveState: MoveState) => void,
    cursor?: string | HTMLElement | Partial<CSSStyleDeclaration>,
    screen?: DOMRect | HTMLElement | Partial<CSSStyleDeclaration>,
    zIndex?: number,
    loopBehavior?: 'loop' | 'stop' | 'infinite',
    trigger?: 'drag' | 'toggle',
    dragOffset?: number,
    disableOnActiveElement?: boolean,
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
    const options = { ...customOption, loopBehavior, trigger, zIndex }

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
        const contextPatch: Pick<MoveContext, 'event' | 'movementX' | 'movementY' | 'x' | 'y' | 'status'> = {
            event: payload,
            movementX: payload.movementX,
            movementY: payload.movementY,
            x: context.x + context.movementX,
            y: context.y + context.movementY,
            status: 'moving',
        }

        if (options.loopBehavior === 'loop') {
            if (contextPatch.x > context.maxWidth) {
                contextPatch.x -= context.maxWidth
            } else if (contextPatch.x < 0) {
                contextPatch.x += context.maxWidth
            }
    
            if (contextPatch.y > context.maxHeight) {
                contextPatch.y -= context.maxHeight
            } else if (contextPatch.y < 0) {
                contextPatch.y += context.maxHeight
            }
        } else if (options.loopBehavior === 'stop') {
            if (contextPatch.x > context.maxWidth) {
                contextPatch.x = context.maxWidth
                context.status = 'stopped'
            } else if (contextPatch.x < 0) {
                contextPatch.x = 0
                contextPatch.status = 'stopped'
            }
    
            if (contextPatch.y > context.maxHeight) {
                contextPatch.y = context.maxHeight
                context.status = 'stopped'
            } else if (contextPatch.y < 0) {
                contextPatch.y = 0
                contextPatch.status = 'stopped'
            }
        }

        const newContext = { ...context, ...contextPatch }

        effect(newContext)

        if (newContext.event.defaultPrevented) {
            return move(context, effect)
        }

        return move(newContext, effect)
    }

    function startup () {
        let nextFn: Iteration<PointerEvent> | undefined

        const localState = {
            targetOnActiveElement: false,
            isDetecting: false,
            startX: 0,
            startY: 0,
        }

        function detectMoveOffset (event: Event) {
            if (!(event instanceof PointerEvent) || !event.buttons || !options.dragOffset) {
                return
            }

            const offset = Math.sqrt(Math.pow(event.clientX - localState.startX, 2) + Math.pow(event.clientY - localState.startY, 2))

            if (offset < options.dragOffset) {
                return
            }

            element.removeEventListener('pointermove', detectMoveOffset)
            localState.isDetecting = false

            active(event)
        }

        function deActive () {
            exitPointerLock()

            options.onLock?.(false)
            document.removeEventListener('pointermove', handlePointerMove)

            nextFn = undefined
            clearCursor()
            clearScreen()
        }

        function handlePointerMove (event: PointerEvent) {
            if (options.trigger === 'drag' && !event.buttons) {
                deActive()
            } else {
                handleContinueMove(event)
            }
        }

        function active (pointerEvent: PointerEvent) {
            const virtualScreen = requestScreen(options.screen, { zIndex: options.zIndex })

            const virtualCursor = requestCursor(options.cursor, { zIndex: options.zIndex })

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

                    options.onMove?.(
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

            options.onLock?.(true)
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

        function handleActive (event: PointerEvent) {
            if (isLocked()) {
                return
            }

            active(event)
        }

        function handleDragActive (event: Event) {
            if (!(event instanceof PointerEvent) || event.button !== 0) {
                return
            }

            if (localState.targetOnActiveElement && options.disableOnActiveElement) {
                return
            }

            handleActive(event)
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

        function handleDragOffsetActive (event: Event) {
            if (!(event instanceof PointerEvent) || event.button !== 0 || !options.dragOffset) {
                return
            }

            if (localState.targetOnActiveElement && options.disableOnActiveElement) {
                return
            }

            if (isLocked()) {
                return
            }

            options?.onPrepareLock?.(event)

            localState.isDetecting = true
            localState.startX = event.clientX
            localState.startY = event.clientY

            element.addEventListener('pointermove', detectMoveOffset)

            element.addEventListener('pointerup', function unbindEvent (event: Event) {
                if (localState.isDetecting) {

                    if (event instanceof PointerEvent) {
                        options?.onCancelPrepareLock?.(event)
                    }
                }

                element.removeEventListener('pointerup', unbindEvent)
                element.removeEventListener('pointermove', detectMoveOffset)
                localState.isDetecting = false
            })
        }

        function markElementIsActiveElement (event: Event) {
            if (!(event instanceof PointerEvent) || event.button !== 0 || !options.disableOnActiveElement) {
                return
            }

            if (event.target === document.activeElement) {
                localState.targetOnActiveElement = true
            } else {
                localState.targetOnActiveElement = false
            }
        }
    
        assertSupportPointerLock()

        if (options.disableOnActiveElement) {
            element.addEventListener('pointerdown', markElementIsActiveElement)
        }

        if (options.trigger === 'drag') {
            if (options.dragOffset) {
                element.addEventListener('pointerdown', handleDragOffsetActive)
                document.addEventListener('pointerup', handleDeActive)

                return () => {
                    element.removeEventListener('pointermove', handleDragOffsetActive)
                    document.removeEventListener('pointerup', handleDeActive)
                    element.removeEventListener('pointerdown', markElementIsActiveElement)
                }
            }

            element.addEventListener('pointerdown', handleDragActive)
            document.addEventListener('pointerup', handleDeActive)

            return () => {
                element.removeEventListener('pointerdown', handleDragActive)
                document.removeEventListener('pointerup', handleDeActive)
                element.removeEventListener('pointerdown', markElementIsActiveElement)
            }
        } else {
            element.addEventListener('pointerdown', handleToggleActive)

            return () => {
                element.removeEventListener('pointerdown', handleToggleActive)
                element.removeEventListener('pointerdown', markElementIsActiveElement)
            }
        }
    
    }

    return startup()
}
