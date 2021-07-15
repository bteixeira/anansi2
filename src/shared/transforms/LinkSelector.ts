import makeTransformationStep from '../through'
import Doc from '../Doc'
import url from 'url'

export default function makeLinkSelectorStep (selector: string) {
	return makeTransformationStep<Doc, string>((doc, emit, done) => {
		doc.$(selector).each(function () {
			const href = doc.$(this).attr('href')
			const resolved = url.resolve(doc.url, href)
			emit(resolved)
		})
		done()
	})
}
