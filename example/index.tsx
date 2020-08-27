import React, {useState} from "react"
import { css } from "emotion"
import { render } from "react-dom"
import GitHubButton from "react-github-btn"
import GridList from "../src/GridList"

import ResizeObserver from "resize-observer-polyfill"
;(window as any).ResizeObserver = ResizeObserver

const ITEM_WIDTH = 300;

interface Image {
	url: string
	width: number
	height: number
}

function getGridGap(elementWidth: number, windowHeight: number) {
	if (elementWidth > 720 && windowHeight > 480) {
		return 10
	} else {
		return 5
	}
}

function getColumnCount(elementWidth: number) {
	return Math.floor(elementWidth / ITEM_WIDTH)
}

function getWindowMargin(windowHeight: number) {
	return Math.round(windowHeight * 1.5)
}

function getItemData(image: Image, columnWidth: number) {
	let imageRatio = image.height / image.width
	let adjustedHeight = Math.round(columnWidth * imageRatio)

	return {
		key: image.url,
		height: adjustedHeight,
	}
}

function getFixedItemData(image: Image) {
	return {
		key: image.url,
		height: image.height,
	}
}

function ImageGridList(props: { images: Image[], fixed: boolean }) {
	return (
		<GridList
			items={props.images}
			getGridGap={getGridGap}
			getColumnCount={getColumnCount}
			getWindowMargin={getWindowMargin}
			getItemData={props.fixed ? getFixedItemData : getItemData}
			fixedItemSize={props.fixed ? ITEM_WIDTH : null}
			renderItem={(image) => {
				return (
					<img
						src={image.url}
						width={image.width}
						height={image.height}
						className={styles.image}
					/>
				)
			}}
		/>
	)
}

function random(low: number, high: number) {
	return Math.floor(Math.random() * high) + low
}

const IMAGES = Array.from({ length: 80 }, (_, index) => {
	let width = 300
	let height = random(200, 300)
	return {
		url: `https://picsum.photos/id/${index + 1}/${width}/${height}.jpg`,
		width,
		height,
	}
})

let styles = {
	headerLink: css`
		text-decoration: none;
		color: inherit;
	`,
	header: css`
		display: flex;
		justify-content: center;
		margin: 100px 0;
		transform: rotate(-2deg);
	`,
	title: css`
		margin: 0;
		color: white;
		text-align: center;
		font-size: 10vw;
		font-weight: 900;
	`,
	circle: css`
		display: flex;
		padding: 20px 40px;
		justify-content: center;
		align-items: center;
		background: hsl(265, 100%, 50%);
		flex-direction: column;
	`,
	switch: css`
		display: flex;
		justify-content: center;
		padding-bottom: 60px;
	`,
	btn: css`
		background: hsl(265, 100%, 50%);
		font-family: inherit;
		border: 0;
		color: white;
		font-weight: bold;
		font-size: 20px;
		padding: 15px 25px;
		cursor: pointer;
		opacity: 0.5;
	`,
	heading: css`
		margin: 100px 0;
		font-size: 10vw;
		font-weight: 900;
		line-height: 1.1;
	`,
	image: css`
		position: relative;
		width: 100%;
		height: auto;
		vertical-align: top;
		background: hsl(0, 0%, 98%);

		transition: 100ms ease;
		transition-property: transform box-shadow;

		&:hover {
			z-index: 1;
			transform: scale(1.25);
			box-shadow: 0 11px 15px -7px rgba(0, 0, 0, 0.2),
				0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12);
		}
	`,
}

const App = () => {
	const [fixed, setFixed] = useState(false);

	return (<>
		<div className={styles.header}>
			<a
				href="https://github.com/jamiebuilds/react-gridlist"
				className={styles.headerLink}
			>
				<div className={styles.circle}>
					<h1 className={styles.title}>{"React <GridList/>"}</h1>
					<GitHubButton
						href="https://github.com/jamiebuilds/react-gridlist"
						data-color-scheme="no-preference: dark; light: dark; dark: dark;"
						data-size="large"
						data-show-count={true}
						aria-label="Star jamiebuilds/react-gridlist on GitHub"
					>
						Star
					</GitHubButton>
				</div>
			</a>
		</div>

		<div className={styles.switch}>
			<button className={styles.btn} style={{opacity: fixed ? 0.5 : 1}} onClick={() => setFixed(false)}>
				Variable width
			</button>
			<button className={styles.btn} style={{opacity: fixed ? 1: 0.5}} onClick={() => setFixed(true)}>
				Fixed width
			</button>
		</div>

		<ImageGridList images={IMAGES} fixed={fixed} />
		<h1 className={styles.heading}>Look ma, more grid...</h1>
		<ImageGridList images={IMAGES} fixed={fixed} />
	</>)
}

render(
	<App />,
	document.getElementById("root"),
)
