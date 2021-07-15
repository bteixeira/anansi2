import makeTransformationStep from '../through'

export default function makeFilterStep<T> (callback: (x: T) => boolean) {
	return makeTransformationStep<T, T>((x, emit, done) => {
		if (callback(x)) {
			emit(x)
		}
		done()
	})
}
