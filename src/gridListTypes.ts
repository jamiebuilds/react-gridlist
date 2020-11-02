import { RefObject } from "react"

export interface GridListItemData {
	key: string
	height: number
}

export interface GridListCell<P> {
	key: string
	columnNumber: number
	rowNumber: number
	offset: number
	height: number
	item: P
}

export interface GridListProps<P> {
	scrollerRef?: RefObject<Element | Window>
	items: P[]
	getGridGap?: (elementWidth: number, windowHeight: number) => number
	getWindowMargin?: (windowHeight: number) => number
	getColumnCount: (elementWidth: number) => number
	getItemData: (item: P, columnWidth: number) => GridListItemData
	renderItem: (item: P) => React.ReactNode
}
