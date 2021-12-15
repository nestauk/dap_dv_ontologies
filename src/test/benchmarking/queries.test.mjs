import { equal, deepEqual } from 'assert';
import { promises as fs } from 'fs';

import pkg from 'glob';
const { glob } = pkg;

import { readQueryFiles, concatenateQueries } from 'queries/query.mjs';
import { querySparql, querySparqlFromFile } from 'queries/fetch.mjs';
import {
	ignoreQueryPaths,
	unstableResultsQueryPaths,
} from '../../node_modules/config.mjs';

const getQueryFiles = (dir, type) => glob.sync(`${dir}/**/*.${type}`);
const zip3 = (a1, a2, a3) => a1.map((x, i) => [x, a2[i], a3[i]]);

const paths = ['graphs/performance', 'graphs/quality']
	.map(dir => getQueryFiles(dir, 'rq'))
	.flat()
	.filter(path => !ignoreQueryPaths.includes(path));

// eslint-disable-next-line
const queries = await readQueryFiles(paths);
const concatenatedQueries = concatenateQueries(queries);
const oneLineQueries = concatenatedQueries.split('\n');

describe('Queries', function () {
	describe('Query Concatenation', function () {
		it('should have one line per query file in the concatenated result', function () {
			equal(concatenatedQueries.split('\n').length, queries.length);
		});

		it('All concatenated queries should run successfully', async function () {
			this.timeout(0);

			const resultObjects = await Promise.all(
				oneLineQueries.map(query =>
					querySparql('virtuoso', query, {
						quiet: true,
					})
				)
			);

			const failedQueries = resultObjects
				.filter(result => !result.isSuccessful)
				.map(resultObject => resultObject.query);

			deepEqual(failedQueries, []);
		});
	});
	describe('Query Results', function () {
		it('All queries should have an associated .csv, even if .csv is empty', async function () {
			const accessResults = await Promise.allSettled(
				paths.map(path => fs.access(path.replace('.rq', '.csv')))
			);
			const unAccessiblePaths = accessResults
				.filter(result => result.status == 'rejected')
				.map(result => result.reason.path);

			deepEqual(unAccessiblePaths, []);
		});

		it('Query results should have identical content to cached result set.', async function () {
			this.timeout(0);

			// ignore files with result sets that are likely to change often,
			const pathsToTest = paths.filter(
				path => !unstableResultsQueryPaths.includes(path)
			);
			const responses = await Promise.all(
				pathsToTest.map(path =>
					querySparqlFromFile('virtuoso', path, {
						quiet: true,
						format: 'text/csv',
					})
				)
			);

			const currentResults = responses.map(response => response.result);
			const cachedResults = await Promise.all(
				pathsToTest.map(path =>
					fs.readFile(path.replace('rq', 'csv'), {
						encoding: 'utf-8',
					})
				)
			);

			const zipped = zip3(pathsToTest, currentResults, cachedResults);
			const comparisons = zipped.map(
				([path, currentResult, cachedResult]) => ({
					path,
					isEqual: currentResult.trim() === cachedResult.trim(),
				})
			);

			const invalidFileQueryPath = comparisons
				.filter(result => !result.isEqual)
				.map(result => result.path);

			deepEqual(invalidFileQueryPath, []);
		});
	});
});
