import { useMemo } from "react"
import { GridListItemData, GridListProps } from "./gridListTypes"
import { GridListContainerData } from "./useGridListContainerData"

export interface GridListEntry<P> {
	item: P
	data: GridListItemData
}

export interface GridListConfigData<P> {
	windowMargin: number
	gridGap: number
	columnCount: number
	entries: GridListEntry<P>[]
}

export function getColumnWidth(
	columnCount: number,
	gridGap: number,
	elementWidth: number,
) {
	let totalGapSpace = (columnCount - 1) * gridGap
	let columnWidth = Math.round((elementWidth - totalGapSpace) / columnCount)

	return columnWidth
}

export default function useGridListConfigData<P>(
	containerData: GridListContainerData,
	props: GridListProps<P>,
): GridListConfigData<P> {
	let {
		items,
		getWindowMargin,
		getGridGap,
		getColumnCount,
		getItemData,
	} = props

	let elementWidth = containerData.elementSize.width

	let windowMargin = useMemo(() => {
		if (getWindowMargin) {
			return getWindowMargin(containerData.scrollerSize.height)
		} else {
			return containerData.scrollerSize.height
		}
	}, [containerData.scrollerSize.height, getWindowMargin])

	let gridGap = useMemo(() => {
		if (getGridGap) {
			return getGridGap(elementWidth, containerData.scrollerSize.height)
		} else {
			return 0
		}
	}, [elementWidth, containerData.scrollerSize.height, getGridGap])

	let columnCount = useMemo(() => {
		return getColumnCount(elementWidth)
	}, [getColumnCount, elementWidth])

	let columnWidth = useMemo(() => {
		let totalGapSpace = (columnCount - 1) * gridGap
		let columnWidth = Math.round((elementWidth - totalGapSpace) / columnCount)
		return columnWidth
	}, [columnCount, gridGap, elementWidth])

	let entries = useMemo(() => {
		return items.map((item) => {
			return {
				data: getItemData(item, columnWidth),
				item,
			}
		})
	}, [items, columnWidth, getItemData])

	return useMemo(() => {
		return {
			windowMargin,
			gridGap,
			columnCount,
			entries,
		}
	}, [windowMargin, gridGap, columnCount, entries])
}
