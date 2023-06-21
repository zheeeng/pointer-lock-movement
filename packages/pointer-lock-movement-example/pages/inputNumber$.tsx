/**
 * @title Input Number
 */

import './layout.scss'

import React, { useEffect, useState, useRef } from 'react'
import { pointerLockMovement, type PointerLockMovementOption } from 'pointer-lock-movement'
import './inputNumber.scss'
import { useEvent } from '../hooks/useEvent'

const resizeHandler = '⟺'

type InputNumberProps = {
    value?: number,
    onChange?: (value: number) => void,
}
    & Pick<PointerLockMovementOption, 'cursor' | 'loopBehavior' | 'trigger'>
    & React.HTMLAttributes<HTMLLabelElement>

const InputNumber = React.memo<InputNumberProps>(
    function InputNumber ({ value = 0, onChange, cursor, className, loopBehavior, trigger, ...labelProps }) {
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

        const pointerLockerRef = useRef<HTMLDivElement>(null)

        useEffect(
            () => {
                if (!pointerLockerRef.current) {
                    return
                }

                return pointerLockMovement(
                    pointerLockerRef.current,
                    {
                        onLock: handlePointerLockChange,
                        onMove: handlePointerLockMovement,
                        cursor,
                        loopBehavior,
                        trigger,
                    }
                )
            },
            [handlePointerLockChange, handlePointerLockMovement, cursor, loopBehavior, trigger],
        )

    
        return (
            <label {...labelProps} className={[className, 'inputNumber'].join(' ')}>
                <div ref={pointerLockerRef}>
                    {resizeHandler}
                </div>
                <input value={typingValue} onChange={handleInputChange} onKeyDown={handleInputKeyDown} onBlur={handleInputBlur}/>
            </label>
        )
    }
)

const customInputContent = '⭐️'

const createCustomCursorElement = () => {
    const githubMonaLoading = document.createElement('img')
    githubMonaLoading.src = 'https://github.githubassets.com/images/mona-loading-dimmed.gif'
    githubMonaLoading.width = 20
    githubMonaLoading.height = 20
    return githubMonaLoading
}

const customCursorElement = createCustomCursorElement()
const customCursorElementCode = `(${createCustomCursorElement.toString()})()`

const customCursorElementStyle = {
    color: 'indianred',
    border: '1px dashed indianred',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
}

const Example = () => {
    const [loopBehavior, setLoopBehavior] = useState<'loop' | 'stop' | 'infinite'>()
    const [trigger, setTrigger] = useState<'drag' | 'toggle'>()

    const handleLoopBehaviorChange = useEvent(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            if (event.target.value === '(empty)') {
                setLoopBehavior(undefined)
            } else {
                setLoopBehavior(event.target.value as 'loop' | 'stop' | 'infinite')
            }
        },
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

    return (
        <div className="layout simple-style">
            <table>
                <thead>
                    <tr>
                        <th>Variant</th>
                        <th>Example</th>
                        <th>Content</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Raw</td>
                        <td><InputNumber cursor={resizeHandler} loopBehavior={loopBehavior} trigger={trigger}/></td>
                        <td><pre>{JSON.stringify(resizeHandler)}</pre></td>
                    </tr>
                    <tr>
                        <td>Custom cursor content</td>
                        <td><InputNumber cursor={customInputContent} loopBehavior={loopBehavior} trigger={trigger}/></td>
                        <td><pre>{JSON.stringify(customInputContent)}</pre></td>
                    </tr>
                    <tr>
                        <td>Custom cursor element</td>
                        <td><InputNumber cursor={customCursorElement} loopBehavior={loopBehavior} trigger={trigger}/></td>
                        <td><pre>{customCursorElementCode}</pre></td>
                    </tr>
                    <tr>
                        <td>Custom cursor CSS</td>
                        <td><InputNumber cursor={customCursorElementStyle} loopBehavior={loopBehavior} trigger={trigger}/></td>
                        <td><pre>{JSON.stringify(customCursorElementStyle, null, 4)}</pre></td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={3}>
                            <label>
                                loopBehavior
                                <select value={loopBehavior} onChange={handleLoopBehaviorChange}>
                                    <option>(use default)</option>
                                    <option value="loop">loop</option>
                                    <option value="stop">stop</option>
                                    <option value="infinite">infinite</option>
                                </select>
                            </label>
                            <label>
                                trigger
                                <select value={trigger} onChange={handleTriggerChange}>
                                    <option>(use default)</option>
                                    <option value="drag">drag</option>
                                    <option value="toggle">toggle</option>
                                </select>
                            </label>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    )
 }

export default Example