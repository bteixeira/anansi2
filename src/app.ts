import Fetcher from './shared/Fetcher'
import Doc from './shared/Doc'
import makeThrough from './shared/through'

Fetcher.fetch('https://wiki.lineageos.org/devices/').
		then(doc => {
			const transformer = makeThrough<Doc, string>((doc, emit) => {
				doc.$('a').each(function () {
					emit(doc.$(this).attr('href') + '\n')
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

