import * as https from 'https'
import Doc from './Doc'
import getStream from 'get-stream'

export default class Fetcher {
	static fetch (url: string): Promise<Doc> {
		return new Promise((resolve, reject) => {
			https.get(url, res => {
				getStream(res).then(body => {
					const doc = new Doc(url, body)
					resolve(doc)
				}).catch(reject)
			})
		})
	}
}
