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

const HEADERS = {
	headers: {
		'Cookie': 'pcah=Q3pwUms1TFNJaE9ZTWZqU05FbGdEYzhGOVhiSXJ5YW5RdC9BeXNVb1R2ND0K; pcar%5fVGVtcGxhdGUgMDMgTWVtYmVycyBBcmVh=WVF6RW0zSEh0c041VnBGTkpUSFJRNVoyd0dRZEtBdnpvNjRBUUNoVDByZkZ3ODNQVXdtVDRnPT0K; ex_referrer=https%3A%2F%2Fwww.cosmid.net%2Fmembers%2Fmodels%2Flara-wolf.html',
	},
}

const first = makeFetcherStep(HEADERS)

first
		.pipe(makeTransformationStep<Doc, string>((doc, emit, done) => {
			doc.$('.featured-scenes .item-portrait h4 a').each(function () {
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
				const resolved = url.resolve(doc.url, href)
				emit(resolved)
			})
			done()
		}))
		.pipe(makeDownloaderStep(HEADERS))
		.pipe(makeUnzipperStep())

first.end('https://www.cosmid.net/members/models/lara-wolf.html')
