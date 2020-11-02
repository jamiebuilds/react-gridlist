import { RefObject, useState, useEffect } from "react"
import useConstRef from "./useConstRef"

export interface TargetSize {
	width: number
	height: number
}

export function isSameTargetSize(a: TargetSize, b: TargetSize) {
	return a.width === b.width && a.height === b.height
}

export function getTargetSize(target: Element | Window): TargetSize {
	if (target instanceof Window) {
		return {
			width: target.innerWidth,
			height: target.innerHeight,
		}
	} else {
		let rect = target.getBoundingClientRect()
		return {
			width: rect.width,
			height: rect.height,
		}
	}
}

export function observeTargetSize(
	target: Element | Window,
	onChange: () => void,
) {
	if (target instanceof Window) {
		window.addEventListener("resize", onChange)
		return () => window.removeEventListener("resize", onChange)
	} else {
		let observer = new ResizeObserver(onChange)
		observer.observe(target)
		return () => observer.disconnect()
	}
}

export default function useElementSize(
	ref: RefObject<Element | Window>,
): TargetSize | null {
	let [targetSize, setTargetSize] = useState(() => {
		if (ref.current) {
			return getTargetSize(ref.current)
		} else {
			return null
		}
	})

	let targetSizeRef = useConstRef(targetSize)

	useEffect(() => {
		if (ref.current === null) return
		let target = ref.current

		return observeTargetSize(target, () => {
			let nextTargetSize = getTargetSize(target)
			let prevTargetSize = targetSizeRef.current
			if (
				prevTargetSize === null ||
				!isSameTargetSize(prevTargetSize, nextTargetSize)
			) {
				setTargetSize(nextTargetSize)
			}
		})
	}, [ref])

	return targetSize
}
