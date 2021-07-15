import * as https from 'https'
import makeTransformationStep from './through'
import * as fs from 'fs'
import * as path from 'path'
import {RequestOptions} from 'https'

function urlBasePath (url: string): string {
	return url.slice(url.lastIndexOf('/'))
}

/*
* New options:
* 	- Target dir
* 	- Filename suffix
* */

export default class Downloader {
	static fetch (url: string, options?: RequestOptions): Promise<string> {
		return new Promise((resolve, reject) => {
			const basepath = urlBasePath(url)
			const filename = `./dump${basepath}`

			if (fs.existsSync(filename)) {
				console.log(`[DOWNL] CACHE ${basepath}`)
				resolve(filename)
			} else {
				console.log(`[DOWNL] START ${basepath}`)
				https.get(url, options, res => {
					fs.mkdirSync(path.dirname(filename), {recursive: true})
					console.log(`[DOWNL] Created dirs`, path.dirname(filename), fs.existsSync(path.dirname(filename)))
					const outputStream = fs.createWriteStream(filename)
					outputStream.on('error', err => console.error('[DOWNL] ERROR', err))
					res.pipe(outputStream)
					res.on('end', () => {
						console.log(`[DOWNL] END ${filename}`)
						resolve(filename)
					})
					res.on('error', err => {
						console.error(err)
						reject(err)
					})
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
