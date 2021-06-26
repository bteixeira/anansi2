import * as through2 from 'through2'

type Transformer<I, O> = (
		input: I,
		emit: (output: O) => void,
		done: () => void,
) => void
type Flusher<O> = (
		emit: (output: O) => void,
		done: () => void,
) => void

export default function makeTransformationStep<I, O> (transformer: Transformer<I, O>, flusher?: Flusher<O>) {
	return through2.obj(function (chunk, enc, callback) {
		transformer(chunk, output => {
			this.push(output)
		}, callback)
	}, flusher && function (callback) {
		flusher(output => {
			this.push(output)
		}, callback)
	})
}
