import Fetcher from './shared/Fetcher'
import Doc from './shared/Doc'
import makeThrough from './shared/through'
import * as url from 'url'

Fetcher.fetch('https://wiki.lineageos.org/devices/').
		then(doc => {
			const transformer = makeThrough<Doc, string>((doc, emit) => {
				const elems = doc.$('.table.device tbody tr:not(.discontinued) th a')
				elems.each(function () {
					const href = doc.$(this).attr('href')
					const resolved = url.resolve(doc.url, href)
					emit(resolved + '\n')
				})
			})
			transformer.pipe(process.stdout)
			transformer.write(doc)
		}).
		catch(err => console.error(err))

// fetch('https://wiki.lineageos.org/devices/').pipeLinks(
// 		(doc, emit) => {
// 			doc.$('.table.device tbody tr[not(.discontinued)] th a').attr('href').forEach(
// 					emit
// 			)
// 		}
// ).pipeRecords(
// 		(doc, emit) => {
// 			const record = {}
// 			doc.$('.deviceinfo.table tr[countChildren()==2]').forEach(tr => {
// 				const [th, td] = tr.children()
// 				record[th.text()] = td.text()
// 			})
// 			emit(record)
// 		}
// ).toCSV('./records.csv')

