import React, { useRef } from "react"
import { GridListProps } from "./gridListTypes"
import useGridListContainerData from "./useGridListContainerData"
import GridListRenderer from "./GridListRenderer"

export default function GridList<P>(props: GridListProps<P>) {
	let gridRootRef = useRef<HTMLDivElement>(null)
	let windowRef = useRef(window)
	let scrollerRef = props.scrollerRef ? props.scrollerRef : windowRef
	let containerData = useGridListContainerData(gridRootRef, scrollerRef)

	return (
		<div
			ref={gridRootRef}
			style={{
				boxSizing: "border-box",
				// height: layoutData !== null ? layoutData.totalHeight : undefined,
				// paddingTop:
				// 	renderData !== null && renderData.firstRenderedRowOffset !== null
				// 		? renderData.firstRenderedRowOffset
				// 		: 0,
			}}
		>
			{containerData !== null && (
				<GridListRenderer
					gridRootRef={gridRootRef}
					gridListProps={props}
					containerData={containerData}
				/>
			)}
		</div>
	)
}
