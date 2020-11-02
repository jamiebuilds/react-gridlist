import { RefObject, useMemo } from "react"
import useTargetSize, { TargetSize } from "./useTargetSize"
import useTargetScroll, { TargetScroll } from "./useTargetScroll"
import useElementOffset, { ElementOffset } from "./useElementOffset"

export interface GridListContainerData {
	scrollerSize: TargetSize
	scrollerScroll: TargetScroll
	elementSize: TargetSize
	elementOffset: ElementOffset
}

export default function useGridListContainerData(
	gridRootRef: RefObject<Element>,
	scrollerRef: RefObject<Element | Window>,
): GridListContainerData | null {
	let scrollerSize = useTargetSize(scrollerRef)
	let scrollerScroll = useTargetScroll(scrollerRef)
	let elementOffset = useElementOffset(gridRootRef, scrollerRef)
	let elementSize = useTargetSize(gridRootRef)

	return useMemo(() => {
		if (
			scrollerSize === null ||
			scrollerScroll === null ||
			elementSize === null ||
			elementOffset === null
		) {
			return null
		}
		return {
			scrollerSize,
			scrollerScroll,
			elementSize,
			elementOffset,
		}
	}, [scrollerSize, scrollerScroll, elementSize, elementOffset])
}
