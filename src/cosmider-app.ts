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

import {makeFetcherStep} from './shared/Fetcher'
import * as fs from 'fs'
import makeTransformationStep from './shared/through'
import Doc from './shared/Doc'
import * as url from 'url'

const first = makeFetcherStep({
	headers: {
		'Cookie': 'pcah=Q3pwUms1TFNJaE9ZTWZqU05FbGdEYzhGOVhiSXJ5YW5RdC9BeXNVb1R2ND0K; pcar%5fVGVtcGxhdGUgMDMgTWVtYmVycyBBcmVh=WVF6RW0zSEh0c041VnBGTkpUSFJRNVoyd0dRZEtBdnpvNjRBUUNoVDByZkZ3ODNQVXdtVDRnPT0K; ex_referrer=https%3A%2F%2Fwww.cosmid.net%2Fmembers%2Fmodels%2Flara-wolf.html',
	},
})

first
		.pipe(makeTransformationStep<Doc, string>((doc, emit, done) => {
			doc.$('.featured-scenes .item-portrait h4 a').each(function () {
				const href = doc.$(this).attr('href')
				const resolved = url.resolve(doc.url, href)
				console.log(resolved)
				emit(resolved)
			})
			done()
		}))
		.pipe(fs.createWriteStream('../dump/csd-members.htm'))

first.end('https://www.cosmid.net/members/models/lara-wolf.html')
