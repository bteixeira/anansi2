import * as through2 from 'through2'

type Transformer<I, O> = (
		input: I,
		emit: (output: O) => void,
) => void

export default function makeThrough<I, O> (transformer: Transformer<I, O>) {
	return through2.obj(function (chunk, enc, flush) {
		transformer(chunk, output => {
			this.push(output)
		})
	})
}
