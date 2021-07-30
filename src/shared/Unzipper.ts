import makeTransformationStep from './through'
import * as path from 'path'
import * as fs from 'fs'
import * as StreamZip from 'node-stream-zip'

/**
 * New options:
 * - target dir (relative)
 */
export function makeUnzipperStep (target = './expanded') {
	return makeTransformationStep<string, string>((filename, emit, done) => {
		console.log(`[UNZIP] START ${filename}`)
		const zip = new StreamZip.async({
			file: filename,
			storeEntries: true,
		})

		const pathname = path.resolve(target, path.basename(filename))

		fs.mkdirSync(pathname, {recursive: true})
		zip.extract(null, pathname).then((count) => {
			console.log(`[UNZIP] Extracted ${count} entries from ${filename}`)
			return zip.close()
		}).then(() => {
			emit(pathname)
			done()
		})
	})
}
