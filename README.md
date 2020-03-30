# React GridList

> A virtual-scrolling GridList component based on CSS Grids.

- Render anything (not just images) of a known width/height inside.
- Variable height items in the same row.
- Highly performant virtual scrolling (aka windowing) for buttery smoothness.
- Customizable & Responsive.
- [Very small bundle size](https://bundlephobia.com/result?p=react-gridlist)

## Install

```sh
npm install --save react-gridlist
```

## Example

```js
import React from "react"
import GridList from "react-gridlist"

function getGridGap(elementWidth: number, windowHeight: number) {
  if (elementWidth > 720 && windowHeight > 480) {
    return 10
  } else {
    return 5
  }
}

function getColumnCount(elementWidth: number) {
  return Math.floor(elementWidth / 300)
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

function Example(props) {
  return (
    <GridList
      items={props.images}
      getGridGap={getGridGap}
      getColumnCount={getColumnCount}
      getWindowMargin={getWindowMargin}
      getItemData={getItemData}
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
```
