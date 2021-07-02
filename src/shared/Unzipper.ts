import makeTransformationStep from './through'
import * as path from 'path'
import * as fs from 'fs'
import * as StreamZip from 'node-stream-zip'

export function makeUnzipperStep () {
	return makeTransformationStep<string, void>((filename, emit, done) => {
		console.log(`[UNZIP] starting ${filename}`)
		const zip = new StreamZip.async({
			file: filename,
			storeEntries: true,
		})

		const pathname = `../expanded/${path.basename(filename)}/`

		fs.mkdirSync(pathname, {recursive: true})
		zip.extract(null, pathname).then((count) => {
			console.log(`Extracted ${count} entries`)
			return zip.close()
		}).then(done)
	})
}
