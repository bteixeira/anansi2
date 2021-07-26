import * as https from 'https'
import Doc from './Doc'
import getStream from 'get-stream'
import makeTransformationStep from './through'
import * as fs from 'fs'
import * as crypto from 'crypto'
import {RequestOptions} from 'https'
import path from 'path'

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
				console.log('[FETCH]', url, 'OK FROM CACHE')
				getStream(fs.createReadStream(cachePath)).then(pipeBody)
			} else {
				https.get(url, options, res => {
					fs.mkdirSync(path.dirname(cachePath), {recursive: true})
					// TODO CHECK IF STREAM CAN BE CREATED, fs.mkdirSync
					res.on('end', () => console.log('[FETCH]', url, 'OK'))
					res.on('error', err => console.error('[FETCH]', url, 'ERROR', err))
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
