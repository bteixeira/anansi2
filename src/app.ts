import {makeFetcherThrough} from './shared/Fetcher'
import Doc from './shared/Doc'
import makeThrough from './shared/through'
import * as url from 'url'
import * as fs from 'fs'
import {Record} from './shared/RecordList'
import makeTabFormatter from './shared/TabFormatter'

const first = makeFetcherThrough()
first.
		pipe(makeThrough<Doc, string>((doc, emit, done) => {
			const elems = doc.$('.table.device tbody tr:not(.discontinued) th a')
			elems.each(function () {
				const href = doc.$(this).attr('href')
				const resolved = url.resolve(doc.url, href)
				emit(resolved)
			})
			done()
		})).
		pipe(makeFetcherThrough()).
		pipe(makeThrough<Doc, Record>((doc, emit, done) => {
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
			emit(record)
			done()
		})).
		pipe(makeTabFormatter()).
		pipe(fs.createWriteStream('./data/data.tsv'))


first.end('https://wiki.lineageos.org/devices/')

