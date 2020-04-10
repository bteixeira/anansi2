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
				emit(
						list.getTableData(includeHeader).map(row =>
								row.map(s => s.replace(/[\t\n]+/g, ' ')).join('\t'),
						).join('\n'),
				)
				done()
			},
	)
}
