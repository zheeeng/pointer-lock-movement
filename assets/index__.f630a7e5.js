import{c as e}from"./index.a9e6f4fc.js";const i={},o="wrapper";function a({components:t,...n}){return e(o,{...i,...n,components:t,mdxType:"MDXLayout"},e("h1",null,"Pointer Lock Movement"),e("p",null,e("a",{parentName:"p",href:"https://nodei.co/npm/pointer-lock-movement/"},e("img",{parentName:"a",src:"https://nodei.co/npm/pointer-lock-movement.png?downloads=true&downloadRank=true&stars=true",alt:"NPM"}))),e("p",null,e("img",{parentName:"p",src:"https://github.com/zheeeng/pointer-lock-movement/actions/workflows/publish.yml/badge.svg",alt:"publish workflow"}),`
`,e("img",{parentName:"p",src:"https://github.com/zheeeng/pointer-lock-movement/actions/workflows/pages.yml/badge.svg",alt:"pages workflow"}),`
`,e("a",{parentName:"p",href:"https://www.npmjs.com/package/pointer-lock-movement"},e("img",{parentName:"a",src:"https://img.shields.io/npm/v/pointer-lock-movement.svg",alt:"npm version"}))),e("p",null,"A pointer lock movement manager for customizing your own creative UI. Inspired by ",e("a",{parentName:"p",href:"https://figma.com/"},"Figma"),"'s number input element: Dragging on an input label and moves a virtual cursor continuously in an infinite looping area and slides the input's figure value."),e("p",null,e("img",{parentName:"p",src:"https://user-images.githubusercontent.com/1303154/177069380-b92d44c9-73ed-45c6-ba50-d89b381d3b51.png",alt:"pointer-lock-movement"})),e("p",null,"This tool toggles the pointer's lock state when user is interacting with a specific HTML element. Its registered callback is triggered when a mouse/trackPad/other pointing device delivers ",e("inlineCode",{parentName:"p"},"PointerEvent")," under the pointer-locked state. You can configure its behaviors as you like."),e("h2",null,"\u{1F9E9}  Installation"),e("pre",null,e("code",{parentName:"pre",className:"language-bash"},`yarn add pointer-lock-movement (or npm/pnpm)
`)),e("h2",null,"\u{1F447} Usage"),e("pre",null,e("code",{parentName:"pre",className:"language-ts"},`import { isSupportPointerLock, pointerLockMovement } from 'pointer-lock-movement'

if (isSupportPointerLock()) {
    const cleanup = pointerLockMovement(TOGGLE_ELEMENT, OPTIONS);

    REQUEST_TO_DISPOSE_THE_LISTENED_EVENTS_CALLBACK(() => {
      cleanup()
    })
}
`)),e("h2",null,"\u{1F4CE}  Example"),e("p",null,"Enhance your input-number component:"),e("pre",null,e("code",{parentName:"pre",className:"language-tsx"},`const [value, setValue] = useState(0);

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
          cursor: '\u27FA',
      }
    )
  },
  [],
)

return (
  <label>
    <div ref={resizeElRef}>\u27FA</div>
    <input value={value} onChange={e => setValue(e.currentTarget.value)} />
  </label>
)
`)),e("p",null,"See more examples:"),e("ol",null,e("li",{parentName:"ol"},e("a",{parentName:"li",href:"https://pointer-lock-movement.zheeeng.me/#/inputNumber"},"Input Number")),e("li",{parentName:"ol"},e("a",{parentName:"li",href:"https://pointer-lock-movement.zheeeng.me/#/magnifyingGlass"},"Magnifying Glass"))),e("h2",null,"\u{1F447} API"),e("table",null,e("thead",{parentName:"table"},e("tr",{parentName:"thead"},e("th",{parentName:"tr",align:null},"Name"),e("th",{parentName:"tr",align:null},"signature"),e("th",{parentName:"tr",align:null},"description"))),e("tbody",{parentName:"table"},e("tr",{parentName:"tbody"},e("td",{parentName:"tr",align:null},e("strong",{parentName:"td"},"isSupportPointerLock")),e("td",{parentName:"tr",align:null},e("inlineCode",{parentName:"td"},"() => boolean")),e("td",{parentName:"tr",align:null},"predicates pointer lock is supported")),e("tr",{parentName:"tbody"},e("td",{parentName:"tr",align:null},e("strong",{parentName:"td"},"pointerLockMovement")),e("td",{parentName:"tr",align:null},e("inlineCode",{parentName:"td"},"(element: Element, option?: PointerLockMovementOption) => () => void")),e("td",{parentName:"tr",align:null},"stars the pointer lock managing for a specific element and returns cleanup function")))),e("h2",null,"\u{1F4DD} Type Definition"),e("pre",null,e("code",{parentName:"pre",className:"language-ts"},`type MoveState = {
    status: 'moving' | 'stopped',
    movementX: number,
    movementY: number,
    offsetX: number,
    offsetY: number,
}

type PointerLockMovementOption = {
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
    disableOnActiveElement?: number,
}
`)),e("ul",null,e("li",{parentName:"ul"},e("inlineCode",{parentName:"li"},"onLock")," registers callback to listen locking state changing"),e("li",{parentName:"ul"},e("inlineCode",{parentName:"li"},"onPrepareLock")," registers callback to listen detecting drag offset"),e("li",{parentName:"ul"},e("inlineCode",{parentName:"li"},"onCancelPrepareLock")," registers callback to listen canceling requesting locker, it triggers on drag movement offset doesn't reach the passed option ",e("inlineCode",{parentName:"li"},"dragOffset"),"."),e("li",{parentName:"ul"},e("inlineCode",{parentName:"li"},"onMove")," registers callback to listen pointer movement, it carries the corresponding event and the moving state. If the ",e("inlineCode",{parentName:"li"},"loopBehavior")," is configured to ",e("inlineCode",{parentName:"li"},"stop")," and the virtual cursor reached the edge of the screen, the ",e("inlineCode",{parentName:"li"},"moveState.status")," will be read as ",e("inlineCode",{parentName:"li"},"stopped"),"."),e("li",{parentName:"ul"},e("inlineCode",{parentName:"li"},"cursor")," is used as the virtual cursor. By default, the cursor is an empty DIV element:",e("ul",{parentName:"li"},e("li",{parentName:"ul"},"if it is a string, it will be used as the cursor's text content,"),e("li",{parentName:"ul"},"if it is an ",e("inlineCode",{parentName:"li"},"HTMLElement"),", it will be used as the virtual cursor,"),e("li",{parentName:"ul"},"if it is an object with a snake-case property names, it will be applied as the cursor's CSS style."))),e("li",{parentName:"ul"},e("inlineCode",{parentName:"li"},"screen")," is used as the virtual screen, it usually defines the edges of the virtual cursor. By default, we count the edges of the browser's viewport.",e("ul",{parentName:"li"},e("li",{parentName:"ul"},"if it is a DOMRect, it will be assumed as the size and position information of the virtual screen,"),e("li",{parentName:"ul"},"if it is an HTMLElement, it will be rendered into the DOM structure,"),e("li",{parentName:"ul"},"if it is an object with a snake-case property name, it will be regarded as the CSS style and render a virtual screen element with this style."))),e("li",{parentName:"ul"},e("inlineCode",{parentName:"li"},"zIndex")," is used as the z-index CSS property of the virtual cursor/screen with the default value ",e("inlineCode",{parentName:"li"},"99999"),", it is useful when there are other elements over it."),e("li",{parentName:"ul"},e("inlineCode",{parentName:"li"},"loopBehavior")," is used to control the behavior of the virtual cursor when it reaches the edge of the screen. By default, it is ",e("inlineCode",{parentName:"li"},"loop"),".",e("ul",{parentName:"li"},e("li",{parentName:"ul"},e("inlineCode",{parentName:"li"},"loop"),": the virtual cursor will be moved to the other side of the screen"),e("li",{parentName:"ul"},e("inlineCode",{parentName:"li"},"stop"),": the virtual cursor will be stopped at the edge of the screen"),e("li",{parentName:"ul"},e("inlineCode",{parentName:"li"},"infinite"),": the virtual cursor will be moved out of the screen"))),e("li",{parentName:"ul"},e("inlineCode",{parentName:"li"},"trigger")," is used to control the triggering way of the virtual cursor. By default, it is ",e("inlineCode",{parentName:"li"},"drag"),".",e("ul",{parentName:"li"},e("li",{parentName:"ul"},e("inlineCode",{parentName:"li"},"drag"),": the virtual cursor movement will be toggled by pointer-down and pointer-up events."),e("li",{parentName:"ul"},e("inlineCode",{parentName:"li"},"toggle"),": the virtual cursor movement will be toggled by pointer events."))),e("li",{parentName:"ul"},e("inlineCode",{parentName:"li"},"dragOffset")," prevent invoking the pointer locker immediately until your pointer moves over the offset pixels."),e("li",{parentName:"ul"},e("inlineCode",{parentName:"li"},"disableOnActiveElement")," prevent pointer locking on active element. e.g. After attaching this feature on an input element, you may wish to select text range while it got focus. ",e("strong",{parentName:"li"},"It only works for ",e("inlineCode",{parentName:"strong"},"drag")," trigger."))))}a.isMDXComponent=!0;const l={},s="wrapper";function r({components:t,...n}){return e(s,{...l,...n,components:t,mdxType:"MDXLayout"},e(a,{mdxType:"README"}))}r.isMDXComponent=!0;var p=Object.freeze(Object.defineProperty({__proto__:null,default:r},Symbol.toStringTag,{value:"Module"}));const m={};m.main=p;export{m as default};
