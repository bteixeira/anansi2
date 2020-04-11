import makeThrough from './through'
import RecordList, {Record} from './RecordList'

export default function makeTabFormatter (includeHeader = true) {
	const list: RecordList = new RecordList()
	return makeThrough<Record, string>(
			(record, emit, done) => {
				list.add(record)
				done()
			},
			(emit, done) => {
				// list.applyTransform(
				// 		(k, v) => {
				// 			if (!v.includes('\n')) {
				// 				return {[k]: v}
				// 			}
				// 			const result: Record = {}
				// 			const parts = v.split('\n').map(s => s.trim())
				// 			parts.forEach((p, i) => result[`${k} [${i}]`] = p)
				// 			return result
				// 		}
				// )
				const data = list.getTableData(includeHeader).map(row =>
						row.map(s => s.replace(/[\t\n]+/g, ' ')).join('\t'),
				).join('\n')
				emit(data)
				done()
			},
	)
}
