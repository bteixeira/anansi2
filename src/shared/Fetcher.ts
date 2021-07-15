import * as https from 'https'
import Doc from './Doc'
import getStream from 'get-stream'
import makeTransformationStep from './through'
import * as fs from 'fs'
import * as crypto from 'crypto'
import {RequestOptions} from 'https'

export function urlBasePath (url: string): string {
	return url.slice(url.lastIndexOf('/'), url.lastIndexOf('.'))
}

function urlToCachePath (url: string): string {
	const normalized = url.replace(/[^a-zA-Z0-9_-]/g, '_')
	const hash = crypto.createHash('sha256').update(url).digest('hex')
	return `./data/cache/${normalized}---${hash}.html`
}

export default class Fetcher {
	static fetch (url: string, options?: RequestOptions): Promise<Doc> {
		return new Promise((resolve, reject) => {
			const cachePath = urlToCachePath(url)

			function pipeBody (body: string) {
				const doc = new Doc(url, body)
				resolve(doc)
			}

			if (fs.existsSync(cachePath)) {
				console.log(`[FETCH] CACHE ${url}`)
				getStream(fs.createReadStream(cachePath)).then(pipeBody)
			} else {
				console.log(`[FETCH] START ${url}`)
				https.get(url, options, res => {
					console.log(`[FETCH] END ${url}`)
					// TODO CHECK IF STREAM CAN BE CREATED, fs.mkdirSync
					res.pipe(fs.createWriteStream(cachePath))
					getStream(res).then(pipeBody).catch(reject)
				})
			}
		})
	}
}

export function makeFetcherStep (options?: RequestOptions) {
	return makeTransformationStep<string, Doc>((url, emit, done) => {
		Fetcher.fetch(url, options).then(doc => {
			emit(doc)
			done()
		})
	})
}
