import { useMemo } from "react"
import { GridListCell } from "./gridListTypes"
import { GridListConfigData } from "./useGridListConfigData"

export interface GridListLayoutData<P> {
	totalHeight: number
	cells: GridListCell<P>[]
}

export default function useGridListLayoutData<P>(
	configData: GridListConfigData<P> | null,
): GridListLayoutData<P> | null {
	return useMemo(() => {
		if (configData === null) return null

		let currentRowNumber = 1
		let prevRowsTotalHeight = 0
		let currentRowMaxHeight = 0

		let cells = configData.entries.map((entry, index) => {
			let key = entry.data.key

			let columnNumber = (index % configData.columnCount) + 1
			let rowNumber = Math.floor(index / configData.columnCount) + 1

			if (rowNumber !== currentRowNumber) {
				currentRowNumber = rowNumber
				prevRowsTotalHeight += currentRowMaxHeight + configData.gridGap
				currentRowMaxHeight = 0
			}

			let offset = prevRowsTotalHeight
			let height = Math.round(entry.data.height)

			currentRowMaxHeight = Math.max(currentRowMaxHeight, height)

			return { key, columnNumber, rowNumber, offset, height, item: entry.item }
		})

		let totalHeight = prevRowsTotalHeight + currentRowMaxHeight

		return { totalHeight, cells }
	}, [configData])
}
