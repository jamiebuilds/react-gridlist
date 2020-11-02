import { useRef, MutableRefObject } from "react"

export type ConstRef<T> = Readonly<MutableRefObject<T>>

export default function useConstRef<T>(value: T): ConstRef<T> {
	let ref = useRef(value)
	ref.current = value
	return ref
}
