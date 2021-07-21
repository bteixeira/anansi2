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
		.pipe(makeLinkSelectorStep('.item-video h4 a'))
		.pipe(makeFetcherStep(HEADERS))
		.pipe(makeLinkSelectorStep('#download_options_block a'))
		.pipe(makeFilterStep<string>(href => {
			console.log('FILTER *** ', href, href.indexOf(config.videoRes) !== -1)
			return href.indexOf(config.videoRes) !== -1
		}))
		.pipe(makeDownloaderStep(`/home/bruno/System/CSMD/${config.modelName}`, HEADERS))

first.write(config.modelPage)
