import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const rootURL =
  "https://hobbitdata.informatik.uni-leipzig.de/LinkedGeoData/downloads.linkedgeodata.org/releases/2015-11-02/";

async function main() {
	const response = await fetch(rootURL);
	const body = await response.text();

	const $ = cheerio.load(body);
	for (const a of $('a')) {
		const link = a.attribs.href;
		if (link.endsWith('.nt.bz2')) {
			console.log(`${rootURL}${link}`);
		}
	}
}

main();
