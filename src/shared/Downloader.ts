import * as https from 'https'
import makeTransformationStep from './through'
import * as fs from 'fs'
import {RequestOptions} from 'https'

function urlBasePath (url: string): string {
	return url.slice(url.lastIndexOf('/'))
}

export default class Downloader {
	static fetch (url: string, options?: RequestOptions): Promise<string> {
		return new Promise((resolve, reject) => {
			const basepath = urlBasePath(url)
			const filename = `../dump/${basepath}`

			if (fs.existsSync(filename)) {
				console.log(`Retrieving from cache ${basepath}`)
				resolve(filename)
			} else {
				console.log(`Downloading ${basepath}`)
				https.get(url, options, res => {
					res.pipe(fs.createWriteStream(filename))
					res.on('end', () => {
						console.log(`Finished Downloading ${filename}`)
						resolve(filename)
					})
					res.on('error', reject)
				})
			}
		})
	}
}

export function makeDownloaderStep (options?: RequestOptions) {
	return makeTransformationStep<string, string>((url, emit, done) => {
		Downloader.fetch(url, options).then(filename => {
			emit(filename)
			done()
		})
	})
}
