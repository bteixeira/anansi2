import makeTransformationStep from './through'

export type Record = {[key: string]: string}

type Transform = (key: string, value: string) => Record

export default class RecordList {
	private records: Record[] = []

	add (record: Record): void {
		this.records.push(record)
	}

	getFieldNames (): string[] {
		const fieldNames = new Set<string>()
		this.records.forEach(r => {
			Object.keys(r).forEach(k => {
				fieldNames.add(k)
			})
		})
		return Array.from(fieldNames)
	}

	getTableData (includeHeader = true): string[][] {
		const result: string[][] = []
		const fieldNames = this.getFieldNames()
		if (includeHeader) {
			result.push(fieldNames)
		}
		this.records.forEach(r => {
			const row = fieldNames.map(f => r[f] || '')
			result.push(row)
		})
		return result
	}

	applyTransform (transform: Transform): void {
		this.records = this.records.map(record => {
			const newRecord: Record = {}
			Object.entries(record).forEach(([k, v]) => {
				const transformed = transform(k, v)
				Object.entries(transformed).forEach(([kk, vv]) => {
					newRecord[kk] = vv
				})
			})
			return newRecord
		})
	}
}

export function makeRecordAggregatorStream () {
	const list: RecordList = new RecordList()
	return makeTransformationStep<Record, RecordList>(
			(record, emit, done) => {
				list.add(record)
				done()
			},
			(emit, done) => {
				emit(list)
				done()
			},
	)
}
