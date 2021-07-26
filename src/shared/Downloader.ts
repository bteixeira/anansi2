import * as https from 'https'
import makeTransformationStep from './through'
import * as fs from 'fs'
import * as path from 'path'
import {RequestOptions} from 'https'
import prettyBytes from 'pretty-bytes'

function urlBasePath (url: string): string {
	return url.slice(url.lastIndexOf('/') + 1)
}

/*
* New options:
* 	- Target dir
* 	- Filename suffix
* */

export default class Downloader {
	static fetch (url: string, target: string, options?: RequestOptions): Promise<string> {
		return new Promise((resolve, reject) => {
			const basepath = urlBasePath(url)
			const filename = path.resolve(target, `${basepath}.tmp`)

			if (fs.existsSync(filename)) {
				console.log('[DOWNL]', filename, 'EXISTS, REUSING')
				resolve(filename)
			} else {
				https.get(url, options, res => {
					fs.mkdirSync(path.dirname(filename), {recursive: true})
					const size = Number(res.headers['content-length'])
					console.log('[DOWNL]', basepath, 'SIZE', prettyBytes(size))
					const outputStream = fs.createWriteStream(filename)
					outputStream.on('error', err => console.error('[DOWNL] ERROR', err))
					res.pipe(outputStream)

					let total = 0
					res.on('data', data => {
						const newTotal = total + data.length
						if (Math.floor(newTotal / size * 10) > Math.floor(total / size * 10)) {
							console.log('[DOWNL]', basepath, `${prettyBytes(newTotal)} of ${prettyBytes(size)} (${Math.round(newTotal / size * 100)}%)`)
						}
						total = newTotal
					})

					res.on('end', () => {
						console.log('[DOWNL]', filename, 'END')
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

export function makeDownloaderStep (target: string, options?: RequestOptions) {
	return makeTransformationStep<string, string>((url, emit, done) => {
		Downloader.fetch(url, target, options).then(filename => {
			emit(filename)
			done()
		})
	})
}
