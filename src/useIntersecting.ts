import { RefObject, useState, useEffect } from "react"

export default function useIntersecting(
	ref: RefObject<Element>,
	rootMargin: string,
) {
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
