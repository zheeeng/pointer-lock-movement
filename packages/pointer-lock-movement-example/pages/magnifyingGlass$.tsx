/**
 * @title Magnifying Glass
 */

import './layout.scss'

import React, { useEffect, useState, useRef } from 'react'
import type { PointerLockMovementOption } from 'pointer-lock-movement'
import { pointerLockMovement } from 'pointer-lock-movement'
import './magnifyingGlass.scss'
import { useEvent } from '../hooks/useEvent'

const interestImageSize = 800
const magnifyingGlassImageSize = 270

type MagnifyingGlassProps = {
    interest: string,
    showHiddenPart: boolean,
}
    & Pick<PointerLockMovementOption, 'screen' | 'loopBehavior' | 'trigger'>
    & React.HTMLAttributes<HTMLDivElement>

const MagnifyingGlass = React.memo<MagnifyingGlassProps>(
    function MagnifyingGlass ({ interest, showHiddenPart, screen, loopBehavior, trigger }) {
        const imgRef = useRef<HTMLImageElement>(null)

        const [{ x, y }, setPosition] = useState({ x: 0, y: 0 })

        const handlePointerLockMovement = useEvent(
            (event: MouseEvent) => {
                setPosition({
                    x: Math.max(magnifyingGlassImageSize - interestImageSize, Math.min(x - event.movementX, 0)),
                    y: Math.max(magnifyingGlassImageSize - interestImageSize, Math.min(y - event.movementY, 0)),
                })
            }
        )

        useEffect(
            () => {
                if (!imgRef.current) {
                    return
                }

                return pointerLockMovement(
                    imgRef.current,
                    {
                        cursor: '🐱',
                        screen,
                        onMove: handlePointerLockMovement,
                        loopBehavior,
                        trigger,
                    }
                )
            },
            [handlePointerLockMovement, loopBehavior, screen, trigger],
        )
    
        return (
            <div className="magnifyingGlass">
                <div className="content" style={{ overflow: showHiddenPart ? 'unset': 'hidden' }}>
                    <img
                        ref={imgRef}
                        className="image"
                        src={`https://source.unsplash.com/random/400x400/?${interest}`}
                        style={{ transform: `translate3D(${x}px, ${y}px, 0px)` }}
                    />
                </div>
                <div className="glass">
                    <div className="findOut">Find out the {interest}</div>
                </div>
            </div>
        )
    }
)

const createCustomScreenDomRect = () => {
    const domRect = new DOMRect()

    domRect.width = 750
    domRect.height = 750
    domRect.x = 150
    domRect.y = 150

    return domRect
}

const customScreenDomRect = createCustomScreenDomRect()
const customScreenDomRectCode = `(${createCustomScreenDomRect.toString()})()`

const createCustomScreenElement = () => {
    const htmlElement = document.createElement('div')
    htmlElement.style.width = '800px'
    htmlElement.style.height = '800px'
    htmlElement.style.border = '1px double blueviolet'
    return htmlElement
}
const customScreenElement = createCustomScreenElement()
const customScreenElementCode = `(${createCustomScreenElement.toString()})()`

const customScreenCSS = {
    color: 'indianred',
    border: '1px dashed indianred',
    width: '80%',
    height: '80%',
}

const Example = () => {
    const [interest, setInterest] = useState('cat')

    const [showHiddenPart, setShowHiddenPart] = useState(false)

    const handleShowHiddenPartChange = useEvent(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setShowHiddenPart(event.target.checked)
        }
    )

    const handleKeydown = useEvent(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                setInterest(e.currentTarget.value)
            }
        }
    )

    const [loopBehavior, setLoopBehavior] = useState<'loop' | 'stop' | 'infinite'>()
    const [trigger, setTrigger] = useState<'drag' | 'click'>()
    const [screen, setScreen] = useState<'DOMRect' | 'HTMLElement' | 'CSS'>()
    const [screenConfig, setScreenConfig] = useState<DOMRect | HTMLElement | Partial<CSSStyleDeclaration>>()
    const [screenDetail, setScreenDetail] = useState('')

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
                setTrigger(event.target.value as 'drag' | 'click')
            }
        },
    )

    const handleScreenChange = useEvent(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            if (event.target.value === '(empty)') {
                setScreen(undefined)
                setScreenDetail('')
            } else {
                const newScreenType = event.target.value as 'DOMRect' | 'HTMLElement' | 'CSS'
                setScreen(newScreenType)
                switch (newScreenType) {
                    case 'DOMRect': {
                        setScreenConfig(customScreenDomRect)
                        setScreenDetail(customScreenDomRectCode)
                        break
                    }
                    case 'HTMLElement': {
                        setScreenConfig(customScreenElement)
                        setScreenDetail(customScreenElementCode)
                        break
                    }
                    case 'CSS': {
                        setScreenConfig(customScreenCSS)
                        setScreenDetail(JSON.stringify(customScreenCSS, null, 4))
                        break
                    }
                }
            }
        },
    )

    return (
        <div className="layout">
            <div className="simple-style control-panel">
                <div style={{  marginBottom: 20 }}>
                    <label style={{ marginRight: 20 }}>
                        {'I\'m interested at '}
                        <input defaultValue={interest} onKeyDown={handleKeydown}/>
                    </label>
                    <label>
                        show hidden part:
                        <input type="checkbox" checked={showHiddenPart} onChange={handleShowHiddenPartChange}/>
                    </label>
                </div>
                <div style={{  marginBottom: 20 }}>
                    <label style={{ marginRight: 20 }}>
                        loopBehavior
                        <select value={loopBehavior} onChange={handleLoopBehaviorChange}>
                            <option>(empty)</option>
                            <option value="loop">loop</option>
                            <option value="stop">stop</option>
                            <option value="infinite">infinite</option>
                        </select>
                    </label>
                    <label style={{ marginRight: 20 }}>
                        trigger
                        <select value={trigger} onChange={handleTriggerChange}>
                            <option>(empty)</option>
                            <option value="drag">drag</option>
                            <option value="click">click</option>
                        </select>
                    </label>
                    <label>
                        screen
                        <select value={screen} onChange={handleScreenChange}>
                            <option>(empty)</option>
                            <option value="CSS">CSS</option>
                            <option value="HTMLElement">HTMLElement</option>
                            <option value="DOMRect">DOMRect</option>
                        </select>
                    </label>
                </div>
                {screenDetail && (
                    <pre>
                        {screenDetail}
                    </pre>)
                }
            </div>

            <MagnifyingGlass
                interest={interest} showHiddenPart={showHiddenPart}
                loopBehavior={loopBehavior} trigger={trigger} screen={screenConfig}
            />
        </div>
    )
 }

export default Example