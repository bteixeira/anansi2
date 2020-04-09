
export type Record = {[key: string]: string}

export default class RecordList {
	private records: Record[] = []

	add (record: Record): void {
		this.records.push(record)
	}
}
