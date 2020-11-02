import { useMemo } from "react"
import { GridListCell } from "./gridListTypes"
import { GridListContainerData } from "./useGridListContainerData"
import { GridListConfigData } from "./useGridListConfigData"
import { GridListLayoutData } from "./useGridListLayoutData"

export interface GridListRenderData<P> {
	cellsToRender: GridListCell<P>[]
	firstRenderedRowNumber: number | null
	firstRenderedRowOffset: number | null
}

export default function useGridListRenderData<P>(
	containerData: GridListContainerData,
	configData: GridListConfigData<P> | null,
	layoutData: GridListLayoutData<P> | null,
): GridListRenderData<P> | null {
	return useMemo(() => {
		if (layoutData === null || configData === null) return null
		let cellsToRender: GridListCell<P>[] = []
		let firstRenderedRowNumber: null | number = null
		let firstRenderedRowOffset: null | number = null

		if (containerData.elementOffset !== null) {
			let elementOffset = containerData.elementOffset.top

			for (let cell of layoutData.cells) {
				let cellTop = elementOffset + cell.offset
				let cellBottom = cellTop + cell.height

				let windowTop = containerData.scrollerScroll.y
				let windowBottom = windowTop + containerData.scrollerSize.height

				let renderTop = windowTop - configData.windowMargin
				let renderBottom = windowBottom + configData.windowMargin

				if (cellTop > renderBottom) continue
				if (cellBottom < renderTop) continue

				if (firstRenderedRowNumber === null) {
					firstRenderedRowNumber = cell.rowNumber
				}

				if (cell.rowNumber === firstRenderedRowNumber) {
					firstRenderedRowOffset = firstRenderedRowOffset
						? Math.min(firstRenderedRowOffset, cell.offset)
						: cell.offset
				}

				cellsToRender.push(cell)
			}
		}

		return { cellsToRender, firstRenderedRowNumber, firstRenderedRowOffset }
	}, [
		layoutData,
		configData,
		containerData.scrollerScroll.y,
		containerData.scrollerSize.height,
		containerData.elementOffset,
	])
}
