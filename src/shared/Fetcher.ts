import * as https from 'https'
import Doc from './Doc'
import getStream from 'get-stream'
import makeThrough from './through'

export default class Fetcher {
	static fetch (url: string): Promise<Doc> {
		return new Promise((resolve, reject) => {
			console.log(`Fetching ${url}`)
			https.get(url, res => {
				getStream(res).then(body => {
					const doc = new Doc(url, body)
					resolve(doc)
				}).catch(reject)
			})
		})
	}
}

export function makeFetcherThrough () {
	return makeThrough<string, Doc>((url, emit, done) => {
		Fetcher.fetch(url).then(doc => {
			emit(doc)
			done()
		})
	})
}
