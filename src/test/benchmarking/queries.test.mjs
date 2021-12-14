import { ok, equal } from 'assert';

import pkg from 'glob';
const { glob } = pkg;

import { readQueryFiles, concatenateQueries } from 'queries/query.mjs';
import { querySparql } from 'queries/fetch.mjs';

const getQueryFiles = (dir, type) => glob.sync(`${dir}/**/*.${type}`);
const zip2 = (a1, a2) => a1.map((x, i) => [x, a2[i]]);

const files = ['graphs/performance', 'graphs/quality']
	.map((dir) => getQueryFiles(dir, 'rq'))
	.flat();

const queries = await readQueryFiles(files);
const concatenatedQueries = concatenateQueries(queries);
const queriesAndFiles = zip2(concatenateQueries.split('\n'), files);

describe('Queries', function () {
	describe('Query Concatenation', function () {
		it('should have one line per query file in the concatenated result', function () {
			equal(concatenatedQueries.split('\n').length, queries.length);
		});

		for (const [query, file] of queriesAndFiles) {
			it(`should succesfully call each one line query: \n${query}\n\n taken from file ${file}`, async function () {
				// long queries need a while to execute
				this.timeout(0);
				ok(await querySparql('virtuoso', query, { quiet: true }));
			});
		}
	});
});