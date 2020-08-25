import React, {
	useRef,
	useMemo,
	useState,
	useEffect,
	RefObject,
	MutableRefObject,
} from "react"

/**
 * ============================================================================
 * Generic Types
 * ============================================================================
 */

type ConstRef<T> = Readonly<MutableRefObject<T>>

interface ElementSize {
	width: number
	height: number
}

interface ElementScroll {
	x: number
	y: number
}

/**
 * ============================================================================
 * Generic Utils
 * ============================================================================
 */

function isSameElementSize(a: ElementSize, b: ElementSize) {
	return a.width === b.width && a.height === b.height
}

function getWindowSize(): ElementSize {
	return {
		width: window.innerWidth,
		height: window.innerHeight,
	}
}

function getElementSize(element: Element): ElementSize {
	let rect = element.getBoundingClientRect()
	return {
		width: rect.width,
		height: rect.height,
	}
}

function isSameElementScroll(a: ElementScroll, b: ElementScroll) {
	return a.x === b.x && a.y === b.y
}

function getWindowScroll(): ElementScroll {
	return {
		x: window.scrollX,
		y: window.scrollY,
	}
}

function getElementOffset(element: Element) {
	return window.scrollY + element.getBoundingClientRect().top
}

/**
 * ============================================================================
 * Utility Hooks
 * ============================================================================
 */

function useConstRef<T>(value: T): ConstRef<T> {
	let ref = useRef(value)
	ref.current = value
	return ref
}

function useWindowSize(): ElementSize {
	let [windowSize, setWindowSize] = useState(() => getWindowSize())
	let windowSizeRef = useConstRef(windowSize)

	useEffect(() => {
		function onResize() {
			let nextWindowSize = getWindowSize()
			if (!isSameElementSize(windowSizeRef.current, nextWindowSize)) {
				setWindowSize(nextWindowSize)
			}
		}
		window.addEventListener("resize", onResize)
		return () => window.removeEventListener("resize", onResize)
	}, [windowSizeRef])

	return windowSize
}

function useElementSize(ref: RefObject<Element>): ElementSize | null {
	let [elementSize, setElementSize] = useState(() => {
		if (ref.current) {
			return getElementSize(ref.current)
		} else {
			return null
		}
	})

	let elementSizeRef = useConstRef(elementSize)

	useEffect(() => {
		let observer = new ResizeObserver((entries) => {
			let nextElementSize = getElementSize(entries[0].target)
			if (
				elementSizeRef.current === null ||
				!isSameElementSize(elementSizeRef.current, nextElementSize)
			) {
				setElementSize(nextElementSize)
			}
		})
		if (ref.current) observer.observe(ref.current)
		return () => observer.disconnect()
	}, [ref])

	return elementSize
}

function useWindowScroll(): ElementScroll {
	let [scrollPosition, setScrollPosition] = useState(getWindowScroll())
	let ref = useConstRef(scrollPosition)

	useEffect(() => {
		function update() {
			let nextScrollPosition = getWindowScroll()
			if (!isSameElementScroll(ref.current, nextScrollPosition)) {
				setScrollPosition(nextScrollPosition)
			}
		}

		window.addEventListener("scroll", update)
		window.addEventListener("resize", update)

		return () => {
			window.removeEventListener("scroll", update)
			window.removeEventListener("resize", update)
		}
	}, [ref])

	return scrollPosition
}

function useElementWindowOffset(ref: RefObject<HTMLElement>) {
	let [elementOffset, setElementOffset] = useState(() => {
		if (ref.current) {
			return getElementOffset(ref.current)
		} else {
			return null
		}
	})

	useEffect(() => {
		let observer = new ResizeObserver((entries) => {
			setElementOffset(getElementOffset(entries[0].target))
		})
		if (ref.current) observer.observe(ref.current)
		return () => observer.disconnect()
	}, [ref])

	return elementOffset
}

function useIntersecting(ref: RefObject<HTMLElement>, rootMargin: string) {
	let [intersecting, setIntersecting] = useState(false)

	useEffect(() => {
		let observer = new IntersectionObserver(
			(entries) => {
				setIntersecting(entries[0].isIntersecting)
			},
			{ rootMargin },
		)
		if (ref.current) observer.observe(ref.current)
		return () => observer.disconnect()
	}, [ref, rootMargin])

	return intersecting
}

/**
 * ============================================================================
 * GridList Types
 * ============================================================================
 */

interface GridListItemData {
	key: string
	height: number
}

interface GridListEntry<P> {
	item: P
	data: GridListItemData
}

interface GridListConfigData<P> {
	windowMargin: number
	gridGap: number
	columnCount: number
	entries: GridListEntry<P>[]
}

interface GridListContainerData {
	windowSize: ElementSize
	elementSize: ElementSize | null
	windowScroll: ElementScroll
	elementWindowOffset: number | null
}

interface GridListCell<P> {
	key: string
	columnNumber: number
	rowNumber: number
	offset: number
	height: number
	item: P
}

interface GridListLayoutData<P> {
	totalHeight: number
	cells: GridListCell<P>[]
}

interface GridListRenderData<P> {
	cellsToRender: GridListCell<P>[]
	firstRenderedRowNumber: number | null
	firstRenderedRowOffset: number | null
}

/**
 * ============================================================================
 * GridList Utils
 * ============================================================================
 */

function getColumnWidth(
	columnCount: number | null,
	gridGap: number | null,
	elementWidth: number | null,
) {
	if (columnCount === null || gridGap === null || elementWidth === null) {
		return null
	}

	let totalGapSpace = (columnCount - 1) * gridGap
	let columnWidth = Math.round((elementWidth - totalGapSpace) / columnCount)

	return columnWidth
}

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

/**
 * ============================================================================
 * GridList Hooks
 * ============================================================================
 */

function useGridListContainerData(
	ref: RefObject<HTMLElement>,
): GridListContainerData {
	let windowSize = useWindowSize()
	let windowScroll = useWindowScroll()
	let elementWindowOffset = useElementWindowOffset(ref)
	let elementSize = useElementSize(ref)

	return useMemo(() => {
		return {
			windowSize,
			windowScroll,
			elementWindowOffset,
			elementSize,
		}
	}, [windowSize, windowScroll, elementWindowOffset, elementSize])
}

function useGridListConfigData<P>(
	containerData: GridListContainerData,
	props: GridListProps<P>,
): GridListConfigData<P> | null {
	let {
		items,
		getWindowMargin,
		getGridGap,
		getColumnCount,
		getItemData,
	} = props

	let elementWidth = containerData.elementSize
		? containerData.elementSize.width
		: null

	let windowMargin = useMemo(() => {
		if (getWindowMargin) {
			return getWindowMargin(containerData.windowSize.height)
		} else {
			return containerData.windowSize.height
		}
	}, [containerData.windowSize.height, getWindowMargin])

	let gridGap = useMemo(() => {
		if (elementWidth === null) return null
		if (getGridGap) {
			return getGridGap(elementWidth, containerData.windowSize.height)
		} else {
			return 0
		}
	}, [elementWidth, containerData.windowSize.height, getGridGap])

	let columnCount = useMemo(() => {
		if (elementWidth === null) return null
		return getColumnCount(elementWidth)
	}, [getColumnCount, elementWidth])

	let columnWidth = getColumnWidth(columnCount, gridGap, elementWidth)

	let entries = useMemo(() => {
		if (columnWidth === null) return null
		let safeColumnWidth = columnWidth
		return items.map((item) => {
			return {
				data: getItemData(item, safeColumnWidth),
				item,
			}
		})
	}, [items, columnWidth, getItemData])

	return useMemo(() => {
		if (
			windowMargin === null ||
			gridGap === null ||
			columnCount === null ||
			entries === null
		) {
			return null
		}
		return {
			windowMargin,
			gridGap,
			columnCount,
			entries,
		}
	}, [windowMargin, gridGap, columnCount, entries])
}

function useGridListLayoutData<P>(
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

function useGridListRenderData<P>(
	containerData: GridListContainerData,
	configData: GridListConfigData<P> | null,
	layoutData: GridListLayoutData<P> | null,
): GridListRenderData<P> | null {
	return useMemo(() => {
		if (layoutData === null || configData === null) return null
		let cellsToRender: GridListCell<P>[] = []
		let firstRenderedRowNumber: null | number = null
		let firstRenderedRowOffset: null | number = null

		if (containerData.elementWindowOffset !== null) {
			let elementWindowOffset = containerData.elementWindowOffset

			for (let cell of layoutData.cells) {
				let cellTop = elementWindowOffset + cell.offset
				let cellBottom = cellTop + cell.height

				let windowTop = containerData.windowScroll.y
				let windowBottom = windowTop + containerData.windowSize.height

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
		containerData.windowScroll.y,
		containerData.windowSize.height,
		containerData.elementWindowOffset,
	])
}

/**
 * ============================================================================
 * GridList
 * ============================================================================
 */

export interface GridListProps<P> {
	items: P[]
	getGridGap?: (elementWidth: number, windowHeight: number) => number
	getWindowMargin?: (windowHeight: number) => number
	getColumnCount: (elementWidth: number) => number
	getItemData: (item: P, columnWidth: number) => GridListItemData
	renderItem: (item: P) => React.ReactNode
	fixedItemSize?: number
}

export default function GridList<P>(props: GridListProps<P>) {
	let ref = useRef<HTMLDivElement>(null)

	let containerData = useGridListContainerData(ref)
	let configData = useGridListConfigData(containerData, props)
	let layoutData = useGridListLayoutData(configData)
	let renderData = useGridListRenderData(containerData, configData, layoutData)

	let intersecting = useIntersecting(
		ref,
		`${configData !== null ? configData.windowMargin : 0}px`,
	)

	const colWidth = props.fixedItemSize ? `${props.fixedItemSize}px` : '1fr';

	return (
		<div
			ref={ref}
			style={{
				boxSizing: "border-box",
				height: layoutData !== null ? layoutData.totalHeight : undefined,
				paddingTop:
					renderData !== null && renderData.firstRenderedRowOffset !== null
						? renderData.firstRenderedRowOffset
						: 0,
			}}
		>
			{intersecting && (
				<div
					style={{
						display: "grid",
						gridTemplateColumns:
							configData !== null
								? `repeat(${configData.columnCount}, ${colWidth})`
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
									{props.renderItem(cell.item)}
								</div>
							)
						})}
				</div>
			)}
		</div>
	)
}
