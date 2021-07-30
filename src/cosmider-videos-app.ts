// Read from file or user input:
// 		Cookie
// 		Model name
// 		Desired video size
// Fetch models page with correct initial: https://www.cosmid.net/members/models/1/name/a/
// Find link with model name
// Fetch
// +Find all photo sets
// 		Find photo set download link
// 		Fetch binary
// +Find all videos
// 		Find video download link according to selected size
// 		Fetch binary


/************************************************************/

import {makeFetcherStep, urlBasePath} from './shared/Fetcher'
import makeTransformationStep from './shared/through'
import Doc from './shared/Doc'
import * as url from 'url'
import {makeDownloaderStep} from './shared/Downloader'
import {makeUnzipperStep} from './shared/Unzipper'
import config from '../cosmider.json'
import makeLinkSelectorStep from './shared/transforms/LinkSelector'
import makeFilterStep from './shared/transforms/Filter'

const HEADERS = {
	headers: {
		'Cookie': config.cookie,
	},
}

console.log('\n*** STARTING APP: VIDEOS ***')

const first = makeFetcherStep(HEADERS)

first
		.pipe(makeTransformationStep<Doc, string>((doc, emit, done) => {
			doc.$('.item-portrait h4 a').each(function () {
				const text = doc.$(this).text().trim().toLowerCase()
				const model = config.modelName.toLowerCase()
				if (text.indexOf(model) === -1) {
					return
				}
				const href = doc.$(this).attr('href')
				const resolved = url.resolve(doc.url, href)
				emit(resolved)
			})
			done()
		}))
		.pipe(makeFetcherStep(HEADERS))

		.pipe(makeLinkSelectorStep('.item-video h4 a'))
		.pipe(makeFetcherStep(HEADERS))
		.pipe(makeTransformationStep<Doc, Doc>((doc, emit, done) => {
			const title = doc.$('.videoDetails h3').eq(0).text().trim()
			console.log('THIS VIDEO IS CALLED', title)
			emit(doc)
			done()
		}))
		.pipe(makeLinkSelectorStep('#download_options_block a'))
		.pipe(makeFilterStep<string>(href => href.indexOf(config.videoRes) !== -1))
		.pipe(makeDownloaderStep(`/home/bruno/System/CSMD/__INCOMING/${config.modelName}`, HEADERS))

first.write(`https://www.cosmid.net/members/models/1/name/${config.modelName[0].toLowerCase()}/`)