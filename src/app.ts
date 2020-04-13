import {makeFetcherThrough} from './shared/Fetcher'
import Doc from './shared/Doc'
import makeThrough from './shared/through'
import * as url from 'url'
import * as fs from 'fs'
import RecordList, {makeAggregatorThrough, Record} from './shared/RecordList'
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
			record['Name'] = doc.$('table.table.deviceinfo tr th[colspan="2"]').eq(0).text().trim()
			doc.$('.deviceinfo.table tr').each((i, el) => {
				const $el = doc.$(el)
				const $children = $el.children()
				if ($children.length !== 2) {
					return
				}
				const key = $children.eq(0).text().trim()
				const value = $children.eq(1).text().trim()//.replace(/\s\s+/g, ' // ')
				record[key] = value
			})
			emit(record)
			done()
		})).
		pipe(makeAggregatorThrough()).
		pipe(makeThrough<RecordList, RecordList>((list, emit, done) => {
			list.applyTransform((k, v) => {
				const EXCLUDE = [
					'Architecture',
					'Network',
					'Bluetooth',
					'Wi-Fi',
					'Maintainers',
					'Supported models',
					'Carrier',
				]
				if (EXCLUDE.includes(k)) {
					return {}
				}
				return {[k]: v}
			})

			list.applyTransform(
					(k, v) => {
						if (!v.includes('\n')) {
							return {[k]: v}
						}

						const parts = v.split('\n').map(s => s.trim()).filter(s => !!s)

						if (k === 'Cameras' || k === 'Supported versions') {
							return {
								[k]: parts.join(' // ')
							}
						} else if (k === 'Peripherals') {
							return {
								[k]: parts.sort().join(' // ')
							}
						}

						const result: Record = {}
						parts.forEach((p, i) => {
							if (i === 0) {
								result[k] = p
							} else {
								result[`${k} [${i}]`] = p
							}
						})
						return result
					},
			)

			list.applyTransform((k, v) => {
				if (k === 'Name') {
					const match = v.match(/^(.+)\([^()]+\)$/)
					if (match) {
						return {[k]: match[1].trim()}
					} else {
						return {[k]: v}
					}
				}

				if (k === 'Dimensions') {
					const match = v.match(/^(.+)\(h\)(.+)\(w\)(.+)\(d\)/)
					if (match) {
						return {
							'Dim H': match[1].trim(),
							'Dim W': match[2].trim(),
							'Dim D': match[3].trim(),
						}
					} else {
						return {[k]: v}
					}
				}

				if (k === 'SoC') {
					const match = v.match(/(Snapdragon\s+\d+)/)
					if (match) {
						return {
							[k]: match[1].trim(),
						}
					} else {
						return {[k]: v}
					}
				}

				let match = k.match(/(Released)(.*)/)
				if (match) {
					const yearMatch = v.match(/^(.+?)(, )?(\d\d\d\d)$/)
					if (yearMatch) {
						return {
							[`Release Year${match[2]}`]: yearMatch[3],
							[`Release Date${match[2]}`]: yearMatch[1].trim(),
						}
					} else {
						return {[k]: v}
					}
				}

				// !!! TODO !!! MUST GET EQUIVALENT OF innerText BY REPLACING <br> WITH \n

				// TODO RAM, must detect all numbers and print min and max
				// TODO CPU [1], separate model and frequency
				// TODO Storage, apply same algo as RAM
				// TODO Screen [1], separate res and PPI
				// TODO Peripherals, before splitting newlines sort alphabetically and join with //
				// TODO Cameras, what a mess, try to get number and max MP
				// TODO Battery, separate type and mAh

				// TODO MERGE RECORDS WITH SMALL VARIATIONS (LG G3)

				return {[k]: v}
			})

			emit(list)
			done()
		})).
		pipe(makeTabFormatter()).
		pipe(fs.createWriteStream('./data/data.tsv'))


first.end('https://wiki.lineageos.org/devices/')

