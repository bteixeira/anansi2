import makeThrough from './through'
import RecordList from './RecordList'

export default function makeTabFormatter (includeHeader = true) {
	return makeThrough<RecordList, string>(
			(list, emit, done) => {
				const data = list.getTableData(includeHeader).map(row =>
						row.map(s => s.replace(/[\t\n]+/g, ' ')).join('\t'),
				).join('\n')
				emit(data)
				done()
			},
	)
}
