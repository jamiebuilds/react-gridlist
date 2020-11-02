import { RefObject, useState, useEffect } from "react"
import useConstRef from "./useConstRef"

export interface TargetScroll {
	x: number
	y: number
}

export function isSameTargetScroll(a: TargetScroll, b: TargetScroll) {
	return a.x === b.x && a.y === b.y
}

export function getTargetScroll(target: Element | Window): TargetScroll {
	if (target instanceof Window) {
		return {
			x: target.scrollX,
			y: target.scrollY,
		}
	} else {
		return {
			x: target.scrollTop,
			y: target.scrollLeft,
		}
	}
}

export function observerTargetScroll(
	target: Element | Window,
	onChange: () => void,
) {
	target.addEventListener("scroll", onChange)
	// TODO: Window resize?
	return () => target.removeEventListener("scroll", onChange)
}

export default function useTargetScroll(
	ref: RefObject<Element | Window>,
): TargetScroll | null {
	let [targetScroll, setTargetScroll] = useState(() => {
		if (ref.current) {
			return getTargetScroll(ref.current)
		} else {
			return null
		}
	})

	let targetScrollRef = useConstRef(targetScroll)

	useEffect(() => {
		if (ref.current === null) return
		let target = ref.current
		return observerTargetScroll(target, () => {
			let nextTargetScroll = getTargetScroll(target)
			let prevTargetScroll = targetScrollRef.current
			if (
				prevTargetScroll === null ||
				!isSameTargetScroll(prevTargetScroll, nextTargetScroll)
			) {
				setTargetScroll(nextTargetScroll)
			}
		})
	}, [ref])

	return targetScroll
}
