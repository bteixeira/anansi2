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

const HEADERS = {
	headers: {
		'Cookie': config.cookie,
	},
}

const first = makeFetcherStep(HEADERS)

first
		.pipe(makeTransformationStep<Doc, string>((doc, emit, done) => {
			doc.$('.item-video h4 a').each(function () {
				const href = doc.$(this).attr('href')
				const resolved = url.resolve(doc.url, href)
				emit(resolved)
			})
			done()
		}))
		.pipe(makeFetcherStep(HEADERS))
		.pipe(makeTransformationStep<Doc, string>((doc, emit, done) => {
			doc.$('#download_options_block a').each(function () {
				const href = doc.$(this).attr('href')
				if (href.indexOf(config.videoRes) !== -1) {
					return
				}
				// console.log(href, )
				const resolved = url.resolve(doc.url, href)
				emit(resolved)
			})
			done()
		}))
		.pipe(makeDownloaderStep(HEADERS))
		.pipe(makeUnzipperStep())

first.write(config.modelPage)
