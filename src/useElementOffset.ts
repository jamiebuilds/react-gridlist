import { RefObject, useState, useEffect } from "react"

import { getTargetScroll } from "./useTargetScroll"

export interface ElementOffset {
	top: number
	left: number
}

export function getElementOffset(target: Element, scroller: Element | Window) {
	let scroll = getTargetScroll(scroller)
	let rect = target.getBoundingClientRect()
	return {
		top: scroll.y + rect.top,
		left: scroll.x + rect.left,
	}
}

export default function useElementOffset(
	targetRef: RefObject<Element>,
	scrollerRef: RefObject<Element | Window>,
): ElementOffset | null {
	let [elementOffset, setElementOffset] = useState(() => {
		if (targetRef.current !== null && scrollerRef.current !== null) {
			return getElementOffset(targetRef.current, scrollerRef.current)
		} else {
			return null
		}
	})

	useEffect(() => {
		if (targetRef.current === null || scrollerRef.current === null) {
			return
		}

		let target = targetRef.current
		let scroller = scrollerRef.current

		let observer = new ResizeObserver(() => {
			setElementOffset(getElementOffset(target, scroller))
		})
		observer.observe(target)
		return () => observer.disconnect()
	}, [targetRef, scrollerRef])

	return elementOffset
}
