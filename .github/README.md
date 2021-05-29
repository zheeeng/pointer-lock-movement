# Pointer Lock Movement

[![NPM](https://nodei.co/npm/pointer-lock-movement.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/pointer-lock-movement/)

![publish workflow](https://github.com/zheeeng/pointer-lock-movement/actions/workflows/publish.yml/badge.svg)
![pages workflow](https://github.com/zheeeng/pointer-lock-movement/actions/workflows/pages.yml/badge.svg)
[![npm version](https://img.shields.io/npm/v/pointer-lock-movement.svg)](https://www.npmjs.com/package/pointer-lock-movement)

A pointer lock movement manager for customizing your own creative UI. Inspired by [Figma](https://figma.com/)'s number input element -- dragging on an input label moves a virtual cursor continuously in an infinite looping area and slides the input's figure value.

![pointer-lock-movement](https://user-images.githubusercontent.com/1303154/177069380-b92d44c9-73ed-45c6-ba50-d89b381d3b51.png)

This tool toggles pointer lock state when interacting with a specific element and continually delivers `MouseEvent`s. You can configure its behavior as you like.

## 🧩  Installation

```bash
yarn add pointer-lock-movement (or npm/pnpm)
```

## 👇 Usage

```ts
if (isSupportPointerLock()) {
    const pointerLockMovement = new pointerLockMovement(element, options);
}
```

## 📎  Example

1. [Input Number](https://pointer-lock-movement.zheeeng.me/#/inputNumber)
2. [Magnifying Glass](https://pointer-lock-movement.zheeeng.me/#/magnifyingGlass)

## 👇 API

| Name | signature | description |
| ---- | --------- | ----------- |
| __isSupportPointerLock__ | `() => boolean` | predicates pointer lock is supported |
| __pointerLockMovement__ | `(element: Element, option?: PointerLockMovementOption) => () => void` | stars the pointer lock managing for a specific element and returns cleanup function

## 📝 Type Definition

```ts
type PointerLockMovementOption = {
    onLock?: (locked: boolean) => void,
    onMove?: (event: MouseEvent, moveState: { status: 'moving' | 'stopped', offsetX: number, offsetY: number }) => void,
    cursor?: string | HTMLElement | Partial<CSSStyleDeclaration>,
    screen?: DOMRect | HTMLElement | Partial<CSSStyleDeclaration>,
    zIndex?: number,
    loopBehavior?: 'loop' | 'stop' | 'infinite',
    trigger?: 'drag' | 'click',
}
```

* `onLock` triggers on lock state changing
* `onMove` triggers mouse movement, it carries the mouse event and the moving state. The status of `moveState` is usually `moving` apart from the `loopBehavior` is configured to `stop` and the virtual cursor reaches the edge of the screen.
* `cursor` is used as the virtual cursor, By default, the cursor is an empty DIV element:
  * if it is a string, it will be used as the cursor's text content,
  * if it is an `HTMLElement`, it will be used as the virtual cursor,
  * if it is an object with a snake-case property names, it will be applied as the cursor's CSS style.
* `screen` is used as the virtual screen, it usually defines the edges of the virtual cursor, by default, we count the edges of the browser's viewport.
  * if it is a DOMRect, it will be assumed as the size and position information of the virtual screen,
  * if it is an HTMLElement, it will be rendered into the DOM structure,
  * if it is an object with a snake-case property name, it will be regarded as the CSS style and render a virtual screen element with this style.
* `zIndex` is used as the z-index CSS property of the virtual cursor/screen with the default value `99999`, it is useful when there are other elements over it.
* `loopBehavior` is used to control the behavior of the virtual cursor when it reaches the edge of the screen.
  * `loop`: the virtual cursor will be moved to the other side of the screen
  * `stop`: the virtual cursor will be stopped at the edge of the screen
  * `infinite`: the virtual cursor will be moved out of the screen
* `trigger` is used to control the triggering way of the virtual cursor.
  * `drag`: the virtual cursor movement will be toggled by mouse-down and mouse-up events.
  * `click`: the virtual cursor movement will be toggled by clicks.

## 💦 TODO

* wheel scrolling control
