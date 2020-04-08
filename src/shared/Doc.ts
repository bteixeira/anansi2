import * as cheerio from 'cheerio'

export default class Doc {
	public readonly $: CheerioStatic

	constructor (
			public url: string,
			public body: string,
	) {
		this.$ = cheerio.load(body)
	}
}
