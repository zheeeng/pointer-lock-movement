/**
 * @title Input Number 2
 */

import './layout.scss'

import React, { useEffect, useState, useRef } from 'react'
import { pointerLockMovement, type PointerLockMovementOption } from 'pointer-lock-movement'
import './inputNumber.scss'
import { useEvent } from '../hooks/useEvent'

type InputNumberProps = {
    value?: number,
    onChange?: (value: number) => void,
    dragOffset?: number,
}
    & Pick<PointerLockMovementOption, 'trigger' | 'dragOffset' | 'disableOnActiveElement'>
    & React.HTMLAttributes<HTMLLabelElement>

const InputNumber = React.memo<InputNumberProps>(
    function InputNumber ({ value = 0, onChange, trigger, dragOffset, disableOnActiveElement, className, ...labelProps }) {
        const [typingValue, setTypingValue] = useState(() => value.toString())
        const [localValue, setLocalValue] = useState(255)

        useEffect(
            () => {
                setLocalValue(value)
                setTypingValue(value.toString())
            },
            [value]
        )
    
        const handleInputChange = useEvent(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setTypingValue(e.currentTarget.value)
            },
        )
    
        const handleInputKeyDown = useEvent(
            (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                    e.currentTarget.blur()
                }
            },
        )
    
        const handleInputBlur = useEvent(
            (e: React.FocusEvent<HTMLInputElement>) => {
                const newValue = +e.currentTarget.value
    
                if (!isNaN(newValue)) {
                    setLocalValue(newValue)
                    onChange?.(value)
                } else {
                    setLocalValue(localValue)
                    setTypingValue(localValue.toString())
                }
            },
        )

        const handlePrepareLock = useEvent(
            (e: PointerEvent) => {
                e.preventDefault()
            }
        )

        const handleCancelPrepareLock = useEvent(
            () => {
            pointerLockerRef.current?.focus()
        })

        const handlePointerLockChange = useEvent(
            (lock: boolean) => {
                if (!lock) {
                    setLocalValue(+typingValue)
                }
            },
        )

        const handlePointerLockMovement = useEvent(
            (event: PointerEvent) => {
                setTypingValue((+typingValue + event.movementX).toString())
            }
        )

        const pointerLockerRef = useRef<HTMLInputElement>(null)

        useEffect(
            () => {
                if (!pointerLockerRef.current) {
                    return
                }

                return pointerLockMovement(
                    pointerLockerRef.current,
                    {
                        onPrepareLock: handlePrepareLock,
                        onCancelPrepareLock: handleCancelPrepareLock,
                        onLock: handlePointerLockChange,
                        onMove: handlePointerLockMovement,
                        cursor: '⟺',
                        trigger,
                        dragOffset,
                        disableOnActiveElement,
                    }
                )
            },
            [handlePointerLockChange, handlePointerLockMovement, dragOffset, trigger, disableOnActiveElement, handlePrepareLock, handleCancelPrepareLock],
        )

    
        return (
            <label {...labelProps} className={[className, 'inputNumber'].join(' ')}>
                <input ref={pointerLockerRef} value={typingValue} onChange={handleInputChange} onKeyDown={handleInputKeyDown} onBlur={handleInputBlur}/>
            </label>
        )
    }
)

const Example = () => {
    const [dragOffset, setDragOffset] = useState(10)
    const [trigger, setTrigger] = useState<'drag' | 'toggle'>()
    const [disableOnActiveElement, setDisableOnActiveElement] = useState(true)

    const handleDragOffsetChange = useEvent(
        (event: React.ChangeEvent<HTMLInputElement>) => setDragOffset(Math.max(Math.min(parseInt(event.target.value) ?? 10, 100), 0))
    )

    const handleTriggerChange = useEvent(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            if (event.target.value === '(empty)') {
                setTrigger(undefined)
            } else {
                setTrigger(event.target.value as 'drag' | 'toggle')
            }
        },
    )

    const handleDisableOnActiveElementChange = useEvent(
        (event: React.ChangeEvent<HTMLInputElement>) => setDisableOnActiveElement(event.target.checked)
    )

    return (
        <div className="simple-style" style={{ padding: 40 }}>
            <div>
                <label>
                    drag with offset 0 ~ 100:
                    <input className="inputNumber" value={dragOffset} onChange={handleDragOffsetChange} />
                </label>
            </div>

            <br />

            <div>
                <label>
                    trigger
                    <select value={trigger} onChange={handleTriggerChange}>
                        <option>(use default)</option>
                        <option value="drag">drag</option>
                        <option value="toggle">toggle</option>
                    </select>
                </label>
            </div>

            <br />

            <div>
                <label>
                    disableOnActiveElement
                    <input type="checkbox" checked={disableOnActiveElement} onChange={handleDisableOnActiveElementChange}/>
                </label>
            </div>

            <hr />

            <main className="layout">
                <h3>Example</h3>
                <br />
                <InputNumber dragOffset={dragOffset} disableOnActiveElement={disableOnActiveElement} trigger={trigger} />
            </main>

        </div>
    )
 }

export default Example