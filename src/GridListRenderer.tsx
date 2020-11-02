import React, { RefObject } from "react"
import { GridListCell, GridListProps } from "./gridListTypes"
import { GridListContainerData } from "./useGridListContainerData"
import useGridListConfigData from "./useGridListConfigData"
import useGridListLayoutData from "./useGridListLayoutData"
import useGridListRenderData, {
	GridListRenderData,
} from "./useGridListRenderData"
import useIntersecting from "./useIntersecting"

function getGridRowStart<P>(
	cell: GridListCell<P>,
	renderData: GridListRenderData<P> | null,
) {
	if (renderData === null) return undefined

	let offset =
		renderData.firstRenderedRowNumber !== null
			? renderData.firstRenderedRowNumber - 1
			: 0
	let gridRowStart = cell.rowNumber - offset

	return `${gridRowStart}`
}

export interface GridListRenderProps<P> {
	gridListProps: GridListProps<P>
	gridRootRef: RefObject<Element>
	containerData: GridListContainerData
}

export default function GridListRenderer<P>(props: GridListRenderProps<P>) {
	let configData = useGridListConfigData(
		props.containerData,
		props.gridListProps,
	)
	let layoutData = useGridListLayoutData(configData)
	let renderData = useGridListRenderData(
		props.containerData,
		configData,
		layoutData,
	)

	let intersecting = useIntersecting(
		props.gridRootRef,
		`${configData !== null ? configData.windowMargin : 0}px`,
	)

	if (!intersecting) {
		return null
	}

	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns:
					configData !== null
						? `repeat(${configData.columnCount}, 1fr)`
						: undefined,
				gridGap: configData ? configData.gridGap : undefined,
				alignItems: "center",
			}}
		>
			{renderData !== null &&
				renderData.cellsToRender.map((cell) => {
					return (
						<div
							key={cell.key}
							style={{
								height: cell.height,
								gridColumnStart: `${cell.columnNumber}`,
								gridRowStart: getGridRowStart(cell, renderData),
							}}
						>
							{props.gridListProps.renderItem(cell.item)}
						</div>
					)
				})}
		</div>
	)
}
