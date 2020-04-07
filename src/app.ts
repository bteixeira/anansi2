import Fetcher from './shared/Fetcher'

Fetcher.fetch('https://wiki.lineageos.org/devices/').
		then(doc => console.log(doc.body)).
		catch(err => console.error(err))
