import {makeFetcherThrough} from './shared/Fetcher'
import Doc from './shared/Doc'
import makeThrough from './shared/through'
import * as url from 'url'
import {Record} from './shared/RecordList'

const first = makeFetcherThrough()
first.
		pipe(makeThrough<Doc, string>((doc, emit) => {
			const elems = doc.$('.table.device tbody tr:not(.discontinued) th a')
			elems.each(function () {
				const href = doc.$(this).attr('href')
				const resolved = url.resolve(doc.url, href)
				emit(resolved)
			})
		})).
		pipe(makeFetcherThrough()).
		pipe(makeThrough<Doc, void>((doc, emit) => {
			const record: Record = {}
			doc.$('.deviceinfo.table tr').each((i, el) => {
				const $el = doc.$(el)
				const $children = $el.children()
				if ($children.length !== 2) {
					return
				}
				const key = $children.eq(0).text().trim()
				const value = $children.eq(1).text().trim().replace(/\s\s+/g, ' // ')
				record[key] = value
			})
			console.log(record)
			emit()
		}))


first.write('https://wiki.lineageos.org/devices/')
// first.end()

