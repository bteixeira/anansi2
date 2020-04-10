
export type Record = {[key: string]: string}

export default class RecordList {
	private readonly records: Record[] = []

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
}
