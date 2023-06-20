# Pointer Lock Movement

[![NPM](https://nodei.co/npm/pointer-lock-movement.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/pointer-lock-movement/)

![publish workflow](https://github.com/zheeeng/pointer-lock-movement/actions/workflows/publish.yml/badge.svg)
![pages workflow](https://github.com/zheeeng/pointer-lock-movement/actions/workflows/pages.yml/badge.svg)
[![npm version](https://img.shields.io/npm/v/pointer-lock-movement.svg)](https://www.npmjs.com/package/pointer-lock-movement)

A pointer lock movement manager for customizing your own creative UI. Inspired by [Figma](https://figma.com/)'s number input element: Dragging on an input label and moves a virtual cursor continuously in an infinite looping area and slides the input's figure value.

![pointer-lock-movement](https://user-images.githubusercontent.com/1303154/177069380-b92d44c9-73ed-45c6-ba50-d89b381d3b51.png)

This tool toggles the pointer's lock state when user is interacting with a specific HTML element. Its registered callback is triggered when a mouse/trackPad/other pointing device delivers `PointerEvent` under the pointer-locked state. You can configure its behaviors as you like.

## 🧩  Installation

```bash
yarn add pointer-lock-movement (or npm/pnpm)
```

## 👇 Usage

```ts
import { isSupportPointerLock, pointerLockMovement } from 'pointer-lock-movement'

if (isSupportPointerLock()) {
    const cleanup = pointerLockMovement(TOGGLE_ELEMENT, OPTIONS);

    REQUEST_TO_DISPOSE_THE_LISTENED_EVENTS_CALLBACK(() => {
      cleanup()
    })
}
```

## 📎  Example

Enhance your input-number component:

```tsx
const [value, setValue] = useState(0);

const pointerLockerRef = useRef<HTMLDivElement>(null)

useEffect(
  () => {
    if (!pointerLockerRef.current) {
      return
    }

    return pointerLockMovement(
      pointerLockerRef.current,
      {
          onMove: evt => setValue(val => val + evt.movementX),
          cursor: '⟺',
      }
    )
  },
  [],
)

return (
  <label>
    <div ref={resizeElRef}>⟺</div>
    <input value={value} onChange={e => setValue(e.currentTarget.value)} />
  </label>
)
```

See more examples:

1. [Input Number](https://pointer-lock-movement.zheeeng.me/#/inputNumber)
2. [Magnifying Glass](https://pointer-lock-movement.zheeeng.me/#/magnifyingGlass)

## 👇 API

| Name | signature | description |
| ---- | --------- | ----------- |
| __isSupportPointerLock__ | `() => boolean` | predicates pointer lock is supported |
| __pointerLockMovement__ | `(element: Element, option?: PointerLockMovementOption) => () => void` | stars the pointer lock managing for a specific element and returns cleanup function

## 📝 Type Definition

```ts
type MoveState = {
    status: 'moving' | 'stopped',
    movementX: number,
    movementY: number,
    offsetX: number,
    offsetY: number,
}

type PointerLockMovementOption = {
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
```

* `onLock` registers callback to listen locking state changing
* `onMove` registers callback to listen pointer movement, it carries the corresponding event and the moving state. If the `loopBehavior` is configured to `stop` and the virtual cursor reached the edge of the screen, the `moveState.status` will be read as `stopped`.
* `cursor` is used as the virtual cursor. By default, the cursor is an empty DIV element:
  * if it is a string, it will be used as the cursor's text content,
  * if it is an `HTMLElement`, it will be used as the virtual cursor,
  * if it is an object with a snake-case property names, it will be applied as the cursor's CSS style.
* `screen` is used as the virtual screen, it usually defines the edges of the virtual cursor. By default, we count the edges of the browser's viewport.
  * if it is a DOMRect, it will be assumed as the size and position information of the virtual screen,
  * if it is an HTMLElement, it will be rendered into the DOM structure,
  * if it is an object with a snake-case property name, it will be regarded as the CSS style and render a virtual screen element with this style.
* `zIndex` is used as the z-index CSS property of the virtual cursor/screen with the default value `99999`, it is useful when there are other elements over it.
* `loopBehavior` is used to control the behavior of the virtual cursor when it reaches the edge of the screen. By default, it is `loop`.
  * `loop`: the virtual cursor will be moved to the other side of the screen
  * `stop`: the virtual cursor will be stopped at the edge of the screen
  * `infinite`: the virtual cursor will be moved out of the screen
* `trigger` is used to control the triggering way of the virtual cursor. By default, it is `drag`.
  * `drag`: the virtual cursor movement will be toggled by pointer-down and pointer-up events.
  * `toggle`: the virtual cursor movement will be toggled by pointer events.
* `dragOffset` prevent invoking the pointer locker immediately until your pointer moves over the offset pixels.
* `disableOnActiveElement` prevent pointer locking on active element. e.g. After attaching this feature on an input element, you may wish to select text range while it got focus.
