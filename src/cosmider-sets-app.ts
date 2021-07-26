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

const HEADERS = {
	headers: {
		'Cookie': config.cookie,
	},
}

console.log('\n*** STARTING APP: SETS ***')

const first = makeFetcherStep(HEADERS)

first
		// TODO PIPE TO HREF SELECTOR TRANSFORM BASED ON MODEL NAME
		// TODO PIPE TO FETCHER
		// 	// TODO CAN ALSO GET MODEL NAME HERE FROM HTML

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


		.pipe(makeLinkSelectorStep('.featured-scenes .item-portrait h4 a'))
		.pipe(makeFetcherStep(HEADERS))
		.pipe(makeLinkSelectorStep('#download_options_block a'))
		.pipe(makeDownloaderStep(`./downloads/${config.modelName}`, HEADERS)) // Target dir
		.pipe(makeUnzipperStep(`/home/bruno/System/CSMD/${config.modelName}`)) // TODO EMITS DIR PATH
		// TODO NEW STEP <VOID> Finds "watermark" subdir and flattens it

first.write(`https://www.cosmid.net/members/models/1/name/${config.modelName[0].toLowerCase()}/`)